"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcClient = void 0;
const ipcBuffer_1 = require("./ipcBuffer");
const ipcMessage_1 = require("./ipcMessage");
/**
 * An IPC client for Inter-Process Communication handling publish/subscribe, request/response, and indication.
 */
class IpcClient {
    /**
     * Constructs a new IPC client for the specified socket.
     * @param socket the client socket
     * @param publishCache the publish cache
     * @param indicationCallback invoked when an indication message is received
     * @param requestCallback invoked when a request message is received
     */
    constructor(socket, publishCache, indicationCallback, requestCallback) {
        this._socket = socket;
        this._buffer = new ipcBuffer_1.IpcBuffer();
        this._subscriptions = [];
        this._publishCache = publishCache;
        this._onIndication = indicationCallback;
        this._onRequest = requestCallback;
    }
    /**
     * Starts the IPC client by handling all incoming events.
     */
    start() {
        // Remove listeners for safety, e.g. when this function was invoked before
        this._socket.removeAllListeners();
        // Register all listeners
        this._socket.on('end', () => {
            this._onEnd();
        });
        this._socket.on('error', (error) => {
            this._onError(error);
        });
        this._socket.on('data', (data) => {
            this._onData(data);
        });
    }
    /**
     * Stops the IPC client and the socket.
     * @details the IPC client should not be used anymore afterwards
     */
    stop() {
        this._subscriptions = [];
        this._socket.end();
        // Do not remove all listeners for the socket to prevent missing an error event
    }
    /**
     * Indicates whether this IPC client connection is open.
     * @returns `true` when open, or `false` otherwise
     */
    isOpen() {
        return !this._socket.destroyed && this._socket.writable && this._socket.readable;
    }
    /**
     * Publishes the specified payload via the IPC client, only when a subscription for the message name is received before.
     * @details the message is cached and re-transmitted once a subscription is received later in time
     * @param name the message name
     * @param message the message
     */
    publish(name, message) {
        if (this._subscriptions.includes(name)) {
            this._socket.write(message.serialize());
        }
    }
    /**
     * Handles end of the IPC client.
     */
    _onEnd() {
        this._socket.end();
    }
    /**
     * Handles errors of the IPC client.
     * @param error the error
     */
    _onError(error) {
        console.error(`${String(Date.now())}:ERR:ipc:client:${error.message}`);
        this._socket.destroy();
    }
    /**
     * Handles data received by the IPC client.
     * @param data the data
     */
    _onData(data) {
        // Filter IPC messages from the received data
        const messages = this._buffer.filter(data.toString());
        // Handle each message
        for (const message of messages) {
            if (message.type === 'subscribe') {
                this._onSubscribe(message);
            }
            else if (message.type === 'unsubscribe') {
                this._onUnsubscribe(message);
            }
            else if (message.type === 'indication') {
                this._onIndication(message);
            }
            else if (message.type === 'request' && message.session !== undefined) {
                this._onRequest(message, payload => {
                    const response = new ipcMessage_1.IpcMessage(message.name, 'response', payload, message.session);
                    this._socket.write(response.serialize());
                });
            }
        }
    }
    /**
     * Handles a received IPC subscribe message.
     * @param message the message
     */
    _onSubscribe(message) {
        // Only add subscription if it does not yet exist
        if (this._subscriptions.includes(message.name)) {
            return;
        }
        // Add the subscription
        this._subscriptions.push(message.name);
        // Publish cached message when available
        if (Object.keys(this._publishCache).includes(message.name)) {
            this._socket.write(this._publishCache[message.name].serialize());
        }
    }
    /**
     * Handles a received IPC unsubscribe message.
     * @param message the message
     */
    _onUnsubscribe(message) {
        // Remove subscription if exists
        const index = this._subscriptions.indexOf(message.name);
        if (index !== -1) {
            this._subscriptions.splice(index, 1);
        }
    }
}
exports.IpcClient = IpcClient;
