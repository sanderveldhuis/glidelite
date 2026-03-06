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
 * An IPC client for Inter-Process Communication handling publish/subscribe, request/response, and indication.
 */
export declare class IpcClient {
    _socket: net.Socket;
    _buffer: IpcBuffer;
    _subscriptions: string[];
    _publishCache: Record<string, IpcMessage>;
    _onIndication: (message: IpcMessage) => void;
    _onRequest: (message: IpcMessage, response: (payload?: IpcPayload) => void) => void;
    /**
     * Constructs a new IPC client for the specified socket.
     * @param socket the client socket
     * @param publishCache the publish cache
     * @param indicationCallback invoked when an indication message is received
     * @param requestCallback invoked when a request message is received
     */
    constructor(socket: net.Socket, publishCache: Record<string, IpcMessage>, indicationCallback: (message: IpcMessage) => void, requestCallback: (message: IpcMessage, response: (payload?: IpcPayload) => void) => void);
    /**
     * Starts the IPC client by handling all incoming events.
     */
    start(): void;
    /**
     * Stops the IPC client and the socket.
     * @details the IPC client should not be used anymore afterwards
     */
    stop(): void;
    /**
     * Indicates whether this IPC client connection is open.
     * @returns `true` when open, or `false` otherwise
     */
    isOpen(): boolean;
    /**
     * Publishes the specified payload via the IPC client, only when a subscription for the message name is received before.
     * @details the message is cached and re-transmitted once a subscription is received later in time
     * @param name the message name
     * @param message the message
     */
    publish(name: string, message: IpcMessage): void;
    /**
     * Handles end of the IPC client.
     */
    _onEnd(): void;
    /**
     * Handles errors of the IPC client.
     * @param error the error
     */
    _onError(error: Error): void;
    /**
     * Handles data received by the IPC client.
     * @param data the data
     */
    _onData(data: Buffer): void;
    /**
     * Handles a received IPC subscribe message.
     * @param message the message
     */
    _onSubscribe(message: IpcMessage): void;
    /**
     * Handles a received IPC unsubscribe message.
     * @param message the message
     */
    _onUnsubscribe(message: IpcMessage): void;
}
