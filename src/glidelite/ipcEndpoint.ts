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

import net from 'node:net';
import { IpcBuffer } from './ipcBuffer';
import {
  IpcMessage,
  IpcPayload
} from './ipcMessage';

const IPC_SESSION_MAX = 9999;

/**
 * Enables sending subscribe, unsubscribe, request, and indication to a specific endpoint via Inter-Process Communication.
 */
export interface IpcEndpoint {
  /**
   * Sends the specified payload as an indication to the endpoint.
   * @details an indication message is `fire-and-forget` and no retry is performed if the endpoint is not connected
   * @param name the message name
   * @param payload the message payload (optional)
   * @details
   * ```js
   * // Sends an indication message with different datatypes to the endpoint with name `application`
   * ipc.to.application?.indication('empty_message');
   * ipc.to.application?.indication('string_message', 'Hello, World!');
   * ipc.to.application?.indication('number_message', 1234);
   * ipc.to.application?.indication('boolean_message', true);
   * ipc.to.application?.indication('null_message', null);
   * ipc.to.application?.indication('object_message', { hello: 'world' });
   * ```
   */
  indication: (name: string, payload?: IpcPayload) => void;

  /**
   * Sends the specified payload as a request to the endpoint.
   * @details a request message works on timeout basis and no retry is performed if the endpoint is not connected
   * @param name the message name
   * @param payload the message payload (optional)
   * @details
   * ```js
   * // Sends a request message with different datatypes to the endpoint with name `application`
   * ipc.to.application?.request('empty_message');
   * ipc.to.application?.request('string_message', 'Hello, World!');
   * ipc.to.application?.request('number_message', 1234);
   * ipc.to.application?.request('boolean_message', true);
   * ipc.to.application?.request('null_message', null);
   * ipc.to.application?.request('object_message', { hello: 'world' });
   * ```
   */
  request: (name: string, payload?: object) => void;

  /**
   * Subscribes with the specified name and registers a callback which is invoked when receiving a publish message from the endpoint.
   * @details the subscription is cached and re-transmitted if the endpoint is (re-)connected
   * @param name the message name
   * @param callback invoked when receiving a publish message
   * @details
   * ```js
   * // Subscribe on a publish message to the endpoint with name `application`
   * ipc.to.application?.subscribe('hello', (name, payload) => {
   *   console.log('Received publish with name:', name, 'payload:', payload);
   * });
   * ```
   */
  subscribe: (name: string, callback: (name: string, payload: IpcPayload) => void) => void;

  /**
   * Unsubscribes with the specified name from the endpoint.
   * @param name the message name
   * @details
   * ```js
   * // Unsubscribe from a publish message to the endpoint with name `application`
   * ipc.to.application?.unsubscribe('hello');
   * ```
   */
  unsubscribe: (name: string) => void;
}

/**
 * @see IpcEndpoint for more details
 */
export class IpcEndpointImpl {
  _name: string;
  _path: string;
  _socket: net.Socket;
  _buffer: IpcBuffer;
  _subscriptions: Record<string, (name: string, payload: IpcPayload) => void>;
  _retryTimer: NodeJS.Timeout | undefined;
  _running: boolean;
  _session: number;

  /**
   * Constructs a new IPC endpoint.
   * @param name the server name of the endpoint
   */
  constructor(name: string) {
    this._name = name;
    this._path = process.platform === 'win32' ? `\\\\.\\pipe\\${__dirname}\\${name}` : `${__dirname}/ipc_${name}`;
    this._socket = new net.Socket();
    this._buffer = new IpcBuffer();
    this._subscriptions = {};
    this._running = false;
    this._session = 1;
  }

  /**
   * Starts the IPC endpoint by handling all incoming events and connecting to the IPC server.
   */
  start(): void {
    this._running = true;

    // Stop running retry timer
    clearTimeout(this._retryTimer);

    // Register all listeners
    this._socket.on('connect', () => {
      this._onConnected();
    });
    this._socket.on('end', () => {
      this._onEnd();
    });
    this._socket.on('error', (error: Error) => {
      this._onError(error);
    });
    this._socket.on('close', () => {
      this._onClose();
    });
    this._socket.on('data', (data: Buffer) => {
      this._onData(data);
    });

    // Start the connection
    this._socket.connect(this._path);
  }

  /**
   * Stops the IPC endpoint and the socket.
   * @details the IPC endpoint should not be used anymore afterwards
   */
  stop(): void {
    this._running = false;

    // Stop running retry timer
    clearTimeout(this._retryTimer);

    // Cleanup and stop the socket
    this._subscriptions = {};
    this._socket.end();
  }

  /**
   * @see IpcEndpoint.indication for more details
   */
  indication(name: string, payload?: IpcPayload): void {
    // Create and send indication message
    const message = new IpcMessage(name, 'indication', payload);
    this._socket.write(message.serialize());
  }

  /**
   * @see IpcEndpoint.request for more details
   */
  request(name: string, payload?: object): void {
    // Create and send request message
    const message = new IpcMessage(name, 'request', payload, this._session);
    this._socket.write(message.serialize());

    // Increment session number
    this._session++;
    if (this._session > IPC_SESSION_MAX) {
      this._session = 1;
    }

    // TODO: should this be a blocking call with timeout waiting for responses? Or better to use a callback function? Or both options?
    // TODO: add request object?
    // TODO: update all documentation
  }

  /**
   * @see IpcEndpoint.subscribe for more details
   */
  subscribe(name: string, callback: (name: string, payload: IpcPayload) => void): void {
    this._subscriptions[name] = callback;
    const message = new IpcMessage(name, 'subscribe');
    this._socket.write(message.serialize());
  }

  /**
   * @see IpcEndpoint.unsubscribe for more details
   */
  unsubscribe(name: string): void {
    delete this._subscriptions[name]; /* eslint-disable-line @typescript-eslint/no-dynamic-delete */
    const message = new IpcMessage(name, 'unsubscribe');
    this._socket.write(message.serialize());
  }

  /**
   * Handles connected of the IPC endpoint.
   */
  _onConnected(): void {
    // Resend cached subscriptions
    for (const name in this._subscriptions) {
      this.subscribe(name, this._subscriptions[name]);
    }
  }

  /**
   * Handles end of the IPC endpoint.
   */
  _onEnd(): void {
    this._socket.end();
  }

  /**
   * Handles errors of the IPC endpoint.
   * @param error the error
   */
  _onError(error: Error): void {
    if (!error.message.includes('ENOENT')) {
      console.error(`ERR:ipc:endpoint:${this._name}:${error.message}`);
    }
    this._socket.destroy();
  }

  /**
   * Handles socket closure of the IPC endpoint.
   */
  _onClose(): void {
    // Stop the socket and remove listeners
    this._socket.destroy();
    this._socket.removeAllListeners();

    // Set retry timer if still running
    if (this._running) {
      this._retryTimer = setTimeout(() => {
        this.start();
      }, 1000);
    }
  }

  /**
   * Handles data received from the IPC endpoint.
   * @param data the data
   */
  _onData(data: Buffer): void {
    // Filter IPC messages from the received data
    const messages = this._buffer.filter(data.toString());

    // Handle each message
    for (const message of messages) {
      if (message.type === 'publish') {
        this._onPublish(message);
      }
      else if (message.type === 'response' && message.session !== undefined) {
        this._onResponse(message);
      }
    }
  }

  /**
   * Handles a received IPC publish message.
   * @param message the message
   */
  _onPublish(message: IpcMessage): void {
    // Invoke registered callback
    if (Object.keys(this._subscriptions).includes(message.name)) {
      this._subscriptions[message.name](message.name, message.payload);
    }
  }

  /**
   * Handles a received IPC response message.
   * @param message the message
   */
  _onResponse(message: IpcMessage): void {
    // TODO: implement
    console.log(message);
  }
}
