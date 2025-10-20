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

import { rmSync } from 'node:fs';
import net from 'node:net';
import { IpcClient } from './ipcClient';
import {
  IpcEndpoint,
  IpcEndpointImpl
} from './ipcEndpoint';
import {
  IpcMessage,
  IpcPayload
} from './ipcMessage';

const IPC_SERVER_RETRY_MS = 1000; // 1 second

/**
 * Provides Inter-Process Communication (IPC) for all GlideLite modules.
 */
export interface Ipc {
  /**
   * Provides all endpoints usable for subscribe, unsubscribe, indication, and request via Inter-Process Communication.
   * @details
   * ```js
   * // Sends an indication message to the endpoint with name `application`
   * ipc.to.application?.indication('hello', { value: 'world' });
   * // Sends a request message to the endpoint with name `application`
   * ipc.to.application?.request('hello', { value: 'world' });
   * // Subscribe on a publish message to the endpoint with name `application`
   * ipc.to.application?.subscribe('hello', (name, payload) => {
   *   console.log('Received publish with name:', name, 'payload:', payload);
   * });
   * // Unsubscribe from a publish message to the endpoint with name `application`
   * ipc.to.application?.unsubscribe('hello');
   * ```
   */
  to: Record<string, IpcEndpoint>;

  /**
   * Starts Inter-Process Communication with the specified endpoints.
   * @param name the name of this endpoint, should be unique for the project
   * @param endpoints the names of endpoints to connect to (optional)
   * @details
   * ```js
   * // Starts IPC by connecting to 'otherapplication1' and 'otherapplication2'
   * ipc.start('myapplication', 'otherapplication1', 'otherapplication2');
   * // Other applications can connect to your application by using:
   * ipc.start('otherapplication1', 'myapplication');
   * ```
   */
  start: (name: string, ...endpoints: string[]) => void;

  /**
   * Stops Inter-Process Communication with all endpoints.
   */
  stop: () => void;

  /**
   * Publishes the specified payload to endpoints which are subscribed to the message name.
   * @details the payload is cached for endpoints who are subscribing later in time
   * @param name the message name
   * @param payload the message payload (optional)
   * @details
   * ```js
   * // Publishes messages with different datatypes
   * ipc.publish('empty_message');
   * ipc.publish('string_message', 'Hello, World!');
   * ipc.publish('number_message', 1234);
   * ipc.publish('boolean_message', true);
   * ipc.publish('null_message', null);
   * ipc.publish('object_message', { hello: 'world' });
   * ```
   */
  publish: (name: string, payload?: IpcPayload) => void;

  /**
   * Registers a callback which is invoked when receiving an indication message from an endpoint.
   * @param callback invoked when receiving an indication message
   * @details
   * ```js
   * // Registers a callback for indication messages
   * ipc.onIndication((name, payload) => {
   *   console.log('Received indication with name:', name, 'payload:', payload);
   * });
   * ```
   */
  onIndication: (callback: (name: string, payload: IpcPayload) => void) => void;

  /**
   * Registers a callback which is invoked when receiving a request message from an endpoint.
   * @param callback invoked when receiving a request message
   * @details
   * ```js
   * // Registers a callback for request messages
   * ipc.onRequest((name, payload, response) => {
   *   console.log('Received request with name:', name, 'payload:', payload);
   *   response({ result: 'successfull' });
   * });
   * ```
   */
  onRequest: (callback: (name: string, payload: IpcPayload, response: (payload?: IpcPayload) => void) => void) => void;
}

/**
 * Provides Inter-Process Communication (IPC) between GlideLite modules and applications.
 */
class IpcImpl {
  _name = '';
  _path = '';
  _server: net.Server = new net.Server({ keepAlive: true });
  _retryTimer: NodeJS.Timeout | undefined;
  _publishCache: Record<string, IpcMessage> = {};
  _clients: IpcClient[] = [];
  _indicationCallbacks: ((name: string, payload: IpcPayload) => void)[] = [];
  _requestCallbacks: ((name: string, payload: IpcPayload, response: (payload?: IpcPayload) => void) => void)[] = [];
  to: Record<string, IpcEndpointImpl> = {};

  /**
   * @see Ipc.start for details
   */
  start(name: string, ...endpoints: string[]): void {
    this._name = name;
    this._path = process.platform === 'win32' ? `\\\\.\\pipe\\${__dirname}\\${name}` : `${__dirname}/ipc_${name}`;

    // Stop if already running for safety
    this.stop();

    // Start connections to other endpoints
    for (const endpoint of endpoints) {
      const ipcEndpoint = new IpcEndpointImpl(endpoint);
      this.to[endpoint] = ipcEndpoint;
      ipcEndpoint.start();
    }

    // Start the server
    this._startServer();
  }

  /**
   * @see Ipc.stop for details
   */
  stop(): void {
    // Stop running retry timer
    clearTimeout(this._retryTimer);

    // Stop the server and remove listeners
    this._server.close();
    this._server.removeAllListeners();

    // Stop all clients and endpoints connections
    for (const endpoint of Object.values(this.to)) {
      endpoint.stop();
    }
    for (const client of this._clients) {
      client.stop();
    }

    // Cleanup
    this._indicationCallbacks = [];
    this._requestCallbacks = [];
    this._publishCache = {};
    this.to = {};
    this._clients = [];
  }

  /**
   * @see Ipc.publish for details
   */
  publish(name: string, payload?: IpcPayload): void {
    const message = new IpcMessage(name, 'publish', payload);
    this._publishCache[name] = message;
    for (const client of this._clients) {
      client.publish(name, message);
    }
  }

  /**
   * @see Ipc.onIndication for details
   */
  onIndication(callback: (name: string, payload: IpcPayload) => void): void {
    if (!this._indicationCallbacks.includes(callback)) {
      this._indicationCallbacks.push(callback);
    }
  }

  /**
   * @see Ipc.onRequest for details
   */
  onRequest(callback: (name: string, payload: IpcPayload, response: (payload?: IpcPayload) => void) => void): void {
    if (!this._requestCallbacks.includes(callback)) {
      this._requestCallbacks.push(callback);
    }
  }

  /**
   * Starts the server
   */
  _startServer(): void {
    // Remove socket file if exists (Windows pipes are removed automatically)
    if (process.platform !== 'win32') {
      rmSync(this._path, { force: true });
    }

    // Register all listeners
    this._server.on('error', (error: Error) => {
      this._onError(error);
    });
    this._server.on('connection', (socket: net.Socket) => {
      this._onConnection(socket);
    });

    // Start listening
    this._server.listen(this._path);
  }

  /**
   * Handles errors of the IPC server.
   * @param error the error
   */
  _onError(error: Error): void {
    console.error(`ERR:ipc:server:${this._name}:${error.message}`);

    // Stop running retry timer
    clearTimeout(this._retryTimer);

    // Stop the server and remove listeners
    this._server.close();
    this._server.removeAllListeners();

    // Stop all clients
    for (const client of this._clients) {
      client.stop();
    }
    this._clients = [];

    // Set retry timer
    this._retryTimer = setTimeout(() => {
      this._startServer();
    }, IPC_SERVER_RETRY_MS);
  }

  /**
   * Handles a new IPC client connecting the IPC server.
   * @param socket the client socket
   */
  _onConnection(socket: net.Socket): void {
    // Accept new connection
    const client = new IpcClient(socket, this._publishCache, message => {
      this._handleIndication(message);
    }, (message, response) => {
      this._handleRequest(message, response);
    });
    this._clients.push(client);
    client.start();

    // Cleanup closed client connections
    for (let i = 0; i < this._clients.length; i++) {
      if (!this._clients[i].isOpen()) {
        this._clients[i].stop();
        this._clients.splice(i, 1);
        i--;
      }
    }
  }

  /**
   * Invoked when an indication message is received on any IPC client.
   * @param message the message
   */
  _handleIndication(message: IpcMessage): void {
    // Invoke all registered callbacks
    for (const callback of this._indicationCallbacks) {
      callback(message.name, message.payload);
    }
  }

  /**
   * Invoked when a request message is received on any IPC client.
   * @param message the message
   * @param response function which can be used to send a response
   */
  _handleRequest(message: IpcMessage, response: (payload?: IpcPayload) => void): void {
    // Invoke all registered callbacks
    for (const callback of this._requestCallbacks) {
      callback(message.name, message.payload, response);
    }
  }
}

/**
 * Provides Inter-Process Communication (IPC) for all GlideLite modules.
 *
 * The supported communication types are:
 * - Subscribe, unsubscribe, and publish (guaranteed delivery)
 * - Indication (fire-and-forget)
 * - Request and response (fire-and-timeout)
 *
 * The maximum size of payload is 1MB.
 */
export const ipc: Ipc = new IpcImpl();
