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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiServer = void 0;
const express_1 = __importDefault(require("express"));
/**
 * An API Server based on Express.
 */
class ApiServer {
    constructor() {
        this._express = (0, express_1.default)().disable('x-powered-by');
    }
    /**
     * Starts the API Server.
     * @param port the API Server port
     * @param handlers custom request handlers
     */
    start(port, handlers) {
        // Add custom request handlers
        for (const handler of handlers) {
            this._express.use(handler);
        }
        // Not found and error handling
        this._express.use((req, res) => {
            this._notFound(req, res);
        });
        this._express.use((err, req, res, next) => {
            this._internalServerError(err, req, res, next);
        });
        // Start the API server
        this._server = this._express.listen(port);
        console.log(`${String(Date.now())}:INF:apiserver:Started API server on port '${String(port)}'`);
    }
    /**
     * Stops the API Server.
     * @details the API Server should not be used anymore after being stopped
     */
    stop() {
        // Stop the API server if running
        if (!this._server) {
            console.log(`${String(Date.now())}:INF:apiserver:Stopped`);
            return;
        }
        this._server.close(() => {
            console.log(`${String(Date.now())}:INF:apiserver:Stopped`);
        });
    }
    /**
     * Handles a 404 Not Found.
     * @param req the HTTP request
     * @param res the HTTP response
     */
    _notFound(req, res) {
        res.status(404).end();
    }
    /**
     * Handles a 500 Internal Server Error.
     * @param req the HTTP request
     * @param res the HTTP response
     */
    _internalServerError(err, req, res, next) {
        console.error(`${String(Date.now())}:ERR:apiserver:${err instanceof Error ? err.message : 'An unknown error occurred'}`);
        res.status(500).end();
    }
}
exports.ApiServer = ApiServer;
