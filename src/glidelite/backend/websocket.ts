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

import { type IncomingMessage } from 'node:http';
import { type WebSocket } from 'ws';

/**
 * The tag used by the WebSocket server to detect WebSocket endpoints, a registered symbol is used so detection also works
 * when multiple copies of this module are loaded.
 */
const SOCKET_TAG = Symbol.for('glidelite.websocket');

/**
 * Definition of a WebSocket endpoint served by the WebSocket server.
 */
export interface WebSocketEndpoint {
  /**
   * The absolute path of the WebSocket endpoint.
   */
  path: string;

  /**
   * Authorizes each connection before the connection is accepted, eg. by validating a cookie or token.
   * @details when it returns `false` or throws an error the connection is rejected, the authorization must complete within 10 seconds
   * @param req the HTTP upgrade request
   * @returns `true` when the connection is allowed, or `false` otherwise
   */
  authorize?: (req: IncomingMessage) => boolean | Promise<boolean>;

  /**
   * Invoked for each accepted connection.
   * @details errors thrown (or promises rejected) in this function close the connection, errors thrown later on in listeners added to
   * the WebSocket are not caught and have to be handled by the listener itself
   * @param ws the connected WebSocket
   * @param req the HTTP upgrade request
   */
  onConnection: (ws: WebSocket, req: IncomingMessage) => void;

  /**
   * The maximum size in bytes of a single incoming message, larger messages close the connection (default: `65536`).
   */
  maxPayloadBytes?: number;

  /**
   * The maximum number of simultaneous connections on this endpoint (default: `5000`).
   */
  maxConnections?: number;

  /**
   * The maximum number of simultaneous connections per client IP address on this endpoint (default: `50`).
   */
  maxConnectionsPerIp?: number;
}

/**
 * Creates a WebSocket endpoint which is served by the WebSocket server.
 * @details the returned WebSocket endpoint has to be exported from a file in the `backend/sockets` directory
 * @param endpoint the WebSocket endpoint
 * @returns the WebSocket endpoint usable for the WebSocket server
 * @details
 * ```js
 * // Import the GlideLite WebSocket layer
 * import { websocket } from 'glidelite/backend';
 *
 * // Construct the WebSocket endpoint
 * export default websocket({
 *   path: '/echo',
 *   onConnection: (ws) => {
 *     console.log('Client connected');
 *     ws.on('message', (data, isBinary) => {
 *       ws.send(data, { binary: isBinary });
 *     });
 *   }
 * });
 * ```
 */
export function websocket(endpoint: WebSocketEndpoint): WebSocketEndpoint {
  return Object.defineProperty({ ...endpoint }, SOCKET_TAG, { value: true });
}
