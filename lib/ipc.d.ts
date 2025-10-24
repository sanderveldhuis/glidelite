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
import { IpcClient } from './ipcClient';
import { IpcEndpoint, IpcEndpointImpl } from './ipcEndpoint';
import { IpcMessage, IpcPayload } from './ipcMessage';
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
     *   response({ result: 'successful' });
     * });
     * ```
     */
    onRequest: (callback: (name: string, payload: IpcPayload, response: (payload?: IpcPayload) => void) => void) => void;
}
/**
 * Provides Inter-Process Communication (IPC) between GlideLite modules and applications.
 */
export declare class IpcImpl {
    _name: string;
    _path: string;
    _server: net.Server;
    _retryTimer: NodeJS.Timeout | undefined;
    _publishCache: Record<string, IpcMessage>;
    _clients: IpcClient[];
    _indicationCallbacks: ((name: string, payload: IpcPayload) => void)[];
    _requestCallbacks: ((name: string, payload: IpcPayload, response: (payload?: IpcPayload) => void) => void)[];
    to: Record<string, IpcEndpointImpl>;
    /**
     * @see Ipc.start for details
     */
    start(name: string, ...endpoints: string[]): void;
    /**
     * @see Ipc.stop for details
     */
    stop(): void;
    /**
     * @see Ipc.publish for details
     */
    publish(name: string, payload?: IpcPayload): void;
    /**
     * @see Ipc.onIndication for details
     */
    onIndication(callback: (name: string, payload: IpcPayload) => void): void;
    /**
     * @see Ipc.onRequest for details
     */
    onRequest(callback: (name: string, payload: IpcPayload, response: (payload?: IpcPayload) => void) => void): void;
    /**
     * Starts the server
     */
    _startServer(): void;
    /**
     * Handles errors of the IPC server.
     * @param error the error
     */
    _onError(error: Error): void;
    /**
     * Handles a new IPC client connecting the IPC server.
     * @param socket the client socket
     */
    _onConnection(socket: net.Socket): void;
    /**
     * Invoked when an indication message is received on any IPC client.
     * @param message the message
     */
    _handleIndication(message: IpcMessage): void;
    /**
     * Invoked when a request message is received on any IPC client.
     * @param message the message
     * @param response function which can be used to send a response
     */
    _handleRequest(message: IpcMessage, response: (payload?: IpcPayload) => void): void;
}
/**
 * Provides Inter-Process Communication (IPC) for all GlideLite modules.
 *
 * The supported messaging patterns are:
 * - Subscribe, unsubscribe, and publish (delivery guaranteed)
 * - Indication (delivery not guaranteed)
 * - Request and response (delivery not guaranteed)
 *
 * The maximum size of payload is 1MB.
 */
export declare const ipc: Ipc;
