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
exports.ipc = exports.IpcImpl = void 0;
const node_fs_1 = require("node:fs");
const net = __importStar(require("node:net"));
const ipcClient_1 = require("./ipcClient");
const ipcEndpoint_1 = require("./ipcEndpoint");
const ipcMessage_1 = require("./ipcMessage");
const IPC_SERVER_RETRY_MS = 1000; // 1 second
/**
 * Provides Inter-Process Communication (IPC) between GlideLite modules and applications.
 */
class IpcImpl {
    constructor() {
        this._name = '';
        this._path = '';
        this._server = new net.Server({ keepAlive: true });
        this._publishCache = {};
        this._clients = [];
        this._indicationCallbacks = [];
        this._requestCallbacks = [];
        this.to = {};
    }
    /**
     * @see Ipc.start for details
     */
    start(name, ...endpoints) {
        this._name = name;
        this._path = process.platform === 'win32' ? `\\\\.\\pipe\\${__dirname}\\${name}` : `${__dirname}/ipc_${name}`;
        // Stop if already running for safety
        this.stop();
        // Start connections to other endpoints
        for (const endpoint of endpoints) {
            const ipcEndpoint = new ipcEndpoint_1.IpcEndpointImpl(endpoint);
            this.to[endpoint] = ipcEndpoint;
            ipcEndpoint.start();
        }
        // Start the server
        this._startServer();
    }
    /**
     * @see Ipc.stop for details
     */
    stop() {
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
    publish(name, payload) {
        const message = new ipcMessage_1.IpcMessage(name, 'publish', payload);
        this._publishCache[name] = message;
        for (const client of this._clients) {
            client.publish(name, message);
        }
    }
    /**
     * @see Ipc.onIndication for details
     */
    onIndication(callback) {
        if (!this._indicationCallbacks.includes(callback)) {
            this._indicationCallbacks.push(callback);
        }
    }
    /**
     * @see Ipc.onRequest for details
     */
    onRequest(callback) {
        if (!this._requestCallbacks.includes(callback)) {
            this._requestCallbacks.push(callback);
        }
    }
    /**
     * Starts the server
     */
    _startServer() {
        // Remove socket file if exists (Windows pipes are removed automatically)
        if (process.platform !== 'win32') {
            (0, node_fs_1.rmSync)(this._path, { force: true });
        }
        // Register all listeners
        this._server.on('error', (error) => {
            this._onError(error);
        });
        this._server.on('connection', (socket) => {
            this._onConnection(socket);
        });
        // Start listening
        this._server.listen(this._path);
    }
    /**
     * Handles errors of the IPC server.
     * @param error the error
     */
    _onError(error) {
        console.error(`${String(Date.now())}:ERR:ipc:server:${this._name}:${error.message}`);
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
    _onConnection(socket) {
        // Accept new connection
        const client = new ipcClient_1.IpcClient(socket, this._publishCache, message => {
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
    _handleIndication(message) {
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
    _handleRequest(message, response) {
        // Invoke all registered callbacks
        for (const callback of this._requestCallbacks) {
            callback(message.name, message.payload, response);
        }
    }
}
exports.IpcImpl = IpcImpl;
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
exports.ipc = new IpcImpl();
