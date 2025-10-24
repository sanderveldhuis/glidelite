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
import * as net from 'node:net';
import { IpcBuffer } from './ipcBuffer';
import { IpcMessage, IpcPayload } from './ipcMessage';
/**
 * IPC endpoint used to subscribe and unsubscribe on a publish message, and send indication and request messages to.
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
     * @details a request message does not have a timeout and no retry is performed if the endpoint is not connected
     * @param name the message name
     * @param payload the message payload
     * @param callback invoked when a response for the request is received
     * @details
     * ```js
     * // Sends a request message with different datatypes to the endpoint with name `application`
     * ipc.to.application?.request('empty_message', (name, payload) => {
     *   console.log('Received response with name:', name, 'payload:', payload);
     * });
     * ipc.to.application?.request('string_message', 'Hello, World!', (name, payload) => {
     *   console.log('Received response with name:', name, 'payload:', payload);
     * });
     * ipc.to.application?.request('number_message', 1234, (name, payload) => {
     *   console.log('Received response with name:', name, 'payload:', payload);
     * });
     * ipc.to.application?.request('boolean_message', true, (name, payload) => {
     *   console.log('Received response with name:', name, 'payload:', payload);
     * });
     * ipc.to.application?.request('null_message', null, (name, payload) => {
     *   console.log('Received response with name:', name, 'payload:', payload);
     * });
     * ipc.to.application?.request('object_message', { hello: 'world' }, (name, payload) => {
     *   console.log('Received response with name:', name, 'payload:', payload);
     * });
     * ```
     */
    request: (name: string, payload: IpcPayload, callback: (name: string, payload?: IpcPayload) => void) => void;
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
export declare class IpcEndpointImpl {
    _name: string;
    _path: string;
    _socket: net.Socket;
    _buffer: IpcBuffer;
    _subscriptions: Record<string, (name: string, payload: IpcPayload) => void>;
    _requests: (((name: string, payload: IpcPayload) => void) | undefined)[];
    _session: number;
    _retryTimer: NodeJS.Timeout | undefined;
    _running: boolean;
    /**
     * Constructs a new IPC endpoint.
     * @param name the server name of the endpoint
     */
    constructor(name: string);
    /**
     * Starts the IPC endpoint by handling all incoming events and connecting to the IPC server.
     */
    start(): void;
    /**
     * Stops the IPC endpoint and the socket.
     * @details the IPC endpoint should not be used anymore afterwards
     */
    stop(): void;
    /**
     * @see IpcEndpoint.indication for more details
     */
    indication(name: string, payload?: IpcPayload): void;
    /**
     * @see IpcEndpoint.request for more details
     */
    request(name: string, payload: IpcPayload, callback: (name: string, payload?: IpcPayload) => void): void;
    /**
     * @see IpcEndpoint.subscribe for more details
     */
    subscribe(name: string, callback: (name: string, payload: IpcPayload) => void): void;
    /**
     * @see IpcEndpoint.unsubscribe for more details
     */
    unsubscribe(name: string): void;
    /**
     * Handles connected of the IPC endpoint.
     */
    _onConnected(): void;
    /**
     * Handles end of the IPC endpoint.
     */
    _onEnd(): void;
    /**
     * Handles errors of the IPC endpoint.
     * @param error the error
     */
    _onError(error: Error): void;
    /**
     * Handles socket closure of the IPC endpoint.
     */
    _onClose(): void;
    /**
     * Handles data received from the IPC endpoint.
     * @param data the data
     */
    _onData(data: Buffer): void;
    /**
     * Handles a received IPC publish message.
     * @param message the message
     */
    _onPublish(message: IpcMessage): void;
    /**
     * Handles a received IPC response message.
     * @param message the message
     */
    _onResponse(message: IpcMessage): void;
}
