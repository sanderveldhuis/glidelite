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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcEndpointImpl = void 0;
const net = __importStar(require("node:net"));
const ipcBuffer_1 = require("./ipcBuffer");
const ipcMessage_1 = require("./ipcMessage");
const IPC_SESSION_MAX = 100; // Only 100 simultaneous requests are possible
/**
 * @see IpcEndpoint for more details
 */
class IpcEndpointImpl {
    /**
     * Constructs a new IPC endpoint.
     * @param name the server name of the endpoint
     */
    constructor(name) {
        this._name = name;
        this._path = process.platform === 'win32' ? `\\\\.\\pipe\\${__dirname}\\${name}` : `${__dirname}/ipc_${name}`;
        this._socket = new net.Socket();
        this._buffer = new ipcBuffer_1.IpcBuffer();
        this._subscriptions = {};
        this._requests = Array(IPC_SESSION_MAX);
        this._session = 1;
        this._running = false;
    }
    /**
     * Starts the IPC endpoint by handling all incoming events and connecting to the IPC server.
     */
    start() {
        // Stop running retry timer
        clearTimeout(this._retryTimer);
        // Ensure restart is done when the close event is received
        this._running = true;
        // Register all listeners
        this._socket.on('connect', () => {
            this._onConnected();
        });
        this._socket.on('end', () => {
            this._onEnd();
        });
        this._socket.on('error', (error) => {
            this._onError(error);
        });
        this._socket.on('close', () => {
            this._onClose();
        });
        this._socket.on('data', (data) => {
            this._onData(data);
        });
        // Start the connection
        this._socket.connect(this._path);
    }
    /**
     * Stops the IPC endpoint and the socket.
     * @details the IPC endpoint should not be used anymore afterwards
     */
    stop() {
        // Stop running retry timer
        clearTimeout(this._retryTimer);
        // Ensure no restart is done when the close event is received
        this._running = false;
        // Cleanup and stop the socket
        this._subscriptions = {};
        this._requests = Array(IPC_SESSION_MAX);
        this._socket.end();
    }
    /**
     * @see IpcEndpoint.indication for more details
     */
    indication(name, payload) {
        // Create and send indication message
        const message = new ipcMessage_1.IpcMessage(name, 'indication', payload);
        this._socket.write(message.serialize());
    }
    /**
     * @see IpcEndpoint.request for more details
     */
    request(name, payload, callback) {
        // Store callback for use when a response is received
        this._requests[this._session - 1] = callback;
        // Create and send request message
        const message = new ipcMessage_1.IpcMessage(name, 'request', payload, this._session);
        this._socket.write(message.serialize());
        // Increment session number for next request
        this._session++;
        if (this._session > IPC_SESSION_MAX) {
            this._session = 1;
        }
    }
    /**
     * @see IpcEndpoint.subscribe for more details
     */
    subscribe(name, callback) {
        this._subscriptions[name] = callback;
        const message = new ipcMessage_1.IpcMessage(name, 'subscribe');
        this._socket.write(message.serialize());
    }
    /**
     * @see IpcEndpoint.unsubscribe for more details
     */
    unsubscribe(name) {
        delete this._subscriptions[name]; /* eslint-disable-line @typescript-eslint/no-dynamic-delete */
        const message = new ipcMessage_1.IpcMessage(name, 'unsubscribe');
        this._socket.write(message.serialize());
    }
    /**
     * Handles connected of the IPC endpoint.
     */
    _onConnected() {
        // Resend cached subscriptions
        for (const name in this._subscriptions) {
            const message = new ipcMessage_1.IpcMessage(name, 'subscribe');
            this._socket.write(message.serialize());
        }
    }
    /**
     * Handles end of the IPC endpoint.
     */
    _onEnd() {
        this._socket.end();
    }
    /**
     * Handles errors of the IPC endpoint.
     * @param error the error
     */
    _onError(error) {
        if (!error.message.includes('ENOENT')) {
            console.error(`${String(Date.now())}:ERR:ipc:endpoint:${this._name}:${error.message}`);
        }
        this._socket.destroy();
    }
    /**
     * Handles socket closure of the IPC endpoint.
     */
    _onClose() {
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
    _onData(data) {
        // Filter IPC messages from the received data
        const messages = this._buffer.filter(data.toString());
        // Handle each message
        for (const message of messages) {
            if (message.type === 'publish') {
                this._onPublish(message);
            }
            else if (message.type === 'response') {
                this._onResponse(message);
            }
        }
    }
    /**
     * Handles a received IPC publish message.
     * @param message the message
     */
    _onPublish(message) {
        // Invoke registered callback
        if (Object.keys(this._subscriptions).includes(message.name)) {
            this._subscriptions[message.name](message.name, message.payload);
        }
    }
    /**
     * Handles a received IPC response message.
     * @param message the message
     */
    _onResponse(message) {
        // Session number is required for request/response
        if (message.session === undefined) {
            return;
        }
        // Validate session number range
        const sessionIndex = message.session - 1;
        if (sessionIndex < 0 || sessionIndex >= IPC_SESSION_MAX) {
            return;
        }
        // Invoke registered callback
        const callback = this._requests[sessionIndex];
        if (callback) {
            callback(message.name, message.payload);
            this._requests[sessionIndex] = undefined;
        }
    }
}
exports.IpcEndpointImpl = IpcEndpointImpl;
