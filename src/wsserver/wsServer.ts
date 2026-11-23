/**
 * MIT License
 *
 * Copyright (c) 2025 Sander Veldhuis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import GracefulShutdown from 'http-graceful-shutdown';
import {
  createServer,
  IncomingMessage,
  Server,
  STATUS_CODES
} from 'node:http';
import { type Duplex } from 'node:stream';
import {
  WebSocket,
  WebSocketServer
} from 'ws';
import { type WebSocketEndpoint } from '../glidelite/backend/websocket';

const PING_INTERVAL_MS = 30000; // 30 seconds
const HANDSHAKE_TIMEOUT_MS = 10000; // 10 seconds
const CLOSE_TIMEOUT_MS = 5000; // 5 seconds
const WEBSOCKET_MAX_PAYLOAD_BYTES = 65536;
const WEBSOCKET_MAX_CONNECTIONS = 5000;

/**
 * A created WebSocket endpoint including the administration of its connections.
 */
export interface WsEndpoint {
  /** The WebSocket endpoint created by the developer */
  endpoint: WebSocketEndpoint;
  /** The WebSocket server handling the endpoint */
  server: WebSocketServer;
  /** The number of connections on the endpoint, including connections still in the handshake */
  connections: number;
}

/**
 * A WebSocket Server based on `ws`.
 */
export class WsServer {
  _server: Server = createServer();
  _endpoints: Map<string, WsEndpoint> = new Map<string, WsEndpoint>();
  _connections: Map<WebSocket, boolean> = new Map<WebSocket, boolean>();
  _pingTimer: NodeJS.Timeout | undefined;
  _closing: Promise<void> | undefined;

  /**
   * Starts the WebSocket Server.
   * @param port the WebSocket Server port
   * @param endpoints the WebSocket endpoints created by the developer
   */
  start(port: number, endpoints: WebSocketEndpoint[]): void {
    // Create WebSockets endpoints
    this._createWebSocketEndpoints(endpoints);

    // Upgrade and error handling
    this._server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
      void this._handleUpgrade(req, socket, head);
    });
    this._server.on('error', (err: unknown) => {
      this._handleError(err);
    });

    // Start pinging endpoint connections
    this._pingTimer = setInterval(() => {
      this._pingConnections();
    }, PING_INTERVAL_MS);
    this._pingTimer.unref();

    // Start the WebSocket server
    this._server.listen(port);
    GracefulShutdown(this._server);

    console.log(`${String(Date.now())}:INF:websocketserver:Started WebSocket server on port '${String(port)}'`);
  }

  /**
   * Stops the WebSocket Server.
   * @details the WebSocket Server should not be used anymore after being stopped
   */
  stop(): void {
    // Stop pinging
    clearInterval(this._pingTimer);

    // Stop open endpoint connections
    const server = this._server;
    void this._closeConnections().then(() => {
      // Stop the WebSocket server
      server.close(() => {
        console.log(`${String(Date.now())}:INF:websocketserver:Stopped`);
      });
    });
  }

  /**
   * Creates the WebSocket endpoints and their servers.
   * @param sockets the WebSocket endpoints
   */
  _createWebSocketEndpoints(endpoints: WebSocketEndpoint[]): void {
    for (const endpoint of endpoints) {
      // No compression to prevent compression bombs and compression side channel attacks
      const server = new WebSocketServer({ noServer: true, maxPayload: endpoint.maxPayloadBytes ?? WEBSOCKET_MAX_PAYLOAD_BYTES, perMessageDeflate: false });
      server.on('error', (err: unknown) => {
        this._handleError(err);
      });
      this._endpoints.set(endpoint.path, { endpoint, server, connections: 0 });
      console.log(`${String(Date.now())}:DBG:websocketserver:Created WebSocket endpoint for path '${endpoint.path}'`);
    }
  }

  /**
   * Handles an HTTP upgrade request from an endpoint connection.
   * @param req the HTTP request
   * @param socket the connection socket
   * @param head the first packet of the upgraded stream
   */
  async _handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): Promise<void> {
    socket.on('error', (err: unknown) => {
      this._handleError(err);
      socket.destroy();
    });

    // The handshake has to complete in time, this includes authorizing
    let handshakeTimeout = false;
    const handshakeTimer = setTimeout(() => {
      handshakeTimeout = true;
      this._rejectUpgrade(socket, 408);
    }, HANDSHAKE_TIMEOUT_MS);

    try {
      // Find the endpoint for the request path
      const endpoint = this._endpoints.get((req.url ?? '').split('?')[0]);
      if (!endpoint) {
        this._rejectUpgrade(socket, 404);
        return;
      }

      // Prevent new connections if the server is closing
      if (this._closing !== undefined) {
        this._rejectUpgrade(socket, 503);
        return;
      }

      // Reserve a slot for the endpoint connection
      if (endpoint.connections >= (endpoint.endpoint.maxConnections ?? WEBSOCKET_MAX_CONNECTIONS)) {
        this._rejectUpgrade(socket, 503);
        return;
      }
      endpoint.connections++;
      socket.once('close', () => {
        endpoint.connections--;
      });

      // Authorize the endpoint connection if the developer defined an authorization function
      let authorized = true;
      if (endpoint.endpoint.authorize) {
        try {
          authorized = await endpoint.endpoint.authorize(req);
        }
        catch (err) {
          this._handleError(err);
          authorized = false;
        }
      }

      // Preventive checks because the handshake might take some time
      if (handshakeTimeout || socket.destroyed) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
        return;
      }

      // Reject the upgrade if the connection is not authorized
      if (!authorized) {
        this._rejectUpgrade(socket, 401);
        return;
      }

      // Prevent new connections if the server is closing because the handshake might take some time
      if (this._closing !== undefined) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
        this._rejectUpgrade(socket, 503);
        return;
      }

      // Proceed with the upgrade
      endpoint.server.handleUpgrade(req, socket, head, ws => {
        this._acceptConnection(endpoint, ws, req);
      });
    }
    catch (err) {
      this._handleError(err);
      this._rejectUpgrade(socket, 500);
    }
    finally {
      clearTimeout(handshakeTimer);
    }
  }

  /**
   * Rejects an HTTP upgrade request with the specified status code and destroys the endpoint connection socket.
   * @param socket the connection socket
   * @param status the HTTP status code
   */
  _rejectUpgrade(socket: Duplex, status: number): void {
    if (socket.writable) {
      socket.end(`HTTP/1.1 ${String(status)} ${STATUS_CODES[status] ?? 'Error'}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`, () => {
        socket.destroy();
      });
    }
    else {
      socket.destroy();
    }
  }

  /**
   * Accepts an endpoint connection after a successful handshake.
   * @param endpoint the connection socket
   * @param ws the WebSocket
   * @param req the HTTP request
   */
  _acceptConnection(endpoint: WsEndpoint, ws: WebSocket, req: IncomingMessage): void {
    this._connections.set(ws, true);
    ws.on('pong', () => {
      if (this._connections.has(ws)) {
        this._connections.set(ws, true);
      }
    });
    ws.on('close', () => {
      this._connections.delete(ws);
    });
    ws.on('error', (err: unknown) => {
      this._handleError(err);
    });

    try {
      const result = (endpoint.endpoint as { onConnection: (ws: WebSocket, req: IncomingMessage) => unknown; }).onConnection(ws, req);
      if (result instanceof Promise) {
        result.catch((err: unknown) => {
          this._handleError(err);
          ws.close(1011, 'Internal Error');
        });
      }
    }
    catch (err) {
      this._handleError(err);
      ws.close(1011, 'Internal Error');
    }
  }

  /**
   * Closes all endpoint connections.
   * @returns a `Promise` which resolves when all connections are closed
   */
  _closeConnections(): Promise<void> {
    this._closing ??= new Promise<void>(resolve => {
      // Create a list of endpoint connections
      const connections = [...this._connections.keys()];
      let remaining = connections.length;
      if (remaining === 0) {
        resolve();
        return;
      }

      // Force close all remaining connections after a timeout
      const timer = setTimeout(() => {
        for (const ws of connections) {
          ws.terminate();
        }
      }, CLOSE_TIMEOUT_MS);

      // Gracefully close all endpoint connections
      for (const ws of connections) {
        ws.once('close', () => {
          if (--remaining === 0) {
            clearTimeout(timer);
            resolve();
          }
        });
        ws.close(1001, 'Going Away');
      }
    });
    return this._closing;
  }

  /**
   * Pings all WebSocket clients and terminates the connection which did not respond to the previous ping.
   */
  _pingConnections(): void {
    for (const [ws, alive] of this._connections) {
      if (!alive) {
        this._connections.delete(ws);
        ws.terminate();
        continue;
      }
      this._connections.set(ws, false);
      ws.ping();
    }
  }

  /**
   * Handles an error.
   * @param err the error
   */
  _handleError(err: unknown): void {
    console.error(`${String(Date.now())}:ERR:websocketserver:${err instanceof Error ? err.message : 'An unknown error occurred'}`);
  }
}
