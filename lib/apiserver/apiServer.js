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
const http_graceful_shutdown_1 = __importDefault(require("http-graceful-shutdown"));
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
     * @param development indicates whether to run the API Server in development mode
     */
    start(port, handlers, development) {
        // Enable headers required for development
        if (development) {
            this._express.use((req, res, next) => {
                this._developmentHeaders(req, res, next);
            });
        }
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
        (0, http_graceful_shutdown_1.default)(this._server);
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
     * Enables HTTP headers required for development.
     * @param req the HTTP request
     * @param res the HTTP response
     * @param next the next function
     */
    _developmentHeaders(req, res, next) {
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow request from React app
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Vary', 'Origin, Accept-Encoding');
        res.setHeader('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
        next();
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
     * @param err the internal server error
     * @param req the HTTP request
     * @param res the HTTP response
     * @param next the next function
     */
    _internalServerError(err, req, res, next) {
        console.error(`${String(Date.now())}:ERR:apiserver:${err instanceof Error ? err.message : 'An unknown error occurred'}`);
        res.status(500).end();
    }
}
exports.ApiServer = ApiServer;
