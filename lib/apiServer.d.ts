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
import express from 'express';
import * as http from 'node:http';
/**
 * An API Server based on Express.
 */
export declare class ApiServer {
    _express: express.Express;
    _server: http.Server | undefined;
    /**
     * Starts the API Server.
     * @param port the API Server port
     * @param handlers custom request handlers
     */
    start(port: number, handlers: express.RequestHandler[]): void;
    /**
     * Stops the API Server.
     * @details the API Server should not be used anymore after being stopped
     */
    stop(): void;
    /**
     * Handles a 404 Not Found.
     * @param req the HTTP request
     * @param res the HTTP response
     */
    _notFound(req: express.Request, res: express.Response): void;
    /**
     * Handles a 500 Internal Server Error.
     * @param req the HTTP request
     * @param res the HTTP response
     */
    _internalServerError(err: unknown, req: express.Request, res: express.Response, next: express.NextFunction): void;
}
