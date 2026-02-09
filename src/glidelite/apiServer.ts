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
export class ApiServer {
  _express: express.Express = express().disable('x-powered-by');
  _server: http.Server | undefined;

  /**
   * Starts the API Server.
   * @param port the API Server port
   * @param handlers custom request handlers
   */
  start(port: number, handlers: express.RequestHandler[]): void {
    // Add custom request handlers
    for (const handler of handlers) {
      this._express.use(handler);
    }

    // Not found and error handling
    this._express.use((req: express.Request, res: express.Response) => {
      this._notFound(req, res);
    });
    this._express.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this._internalServerError(err, req, res, next);
    });

    // Start the API server
    this._server = this._express.listen(port);

    console.log(`INF:apiserver:Started API server on port '${String(port)}'`);
  }

  /**
   * Stops the API Server.
   * @details the API Server should not be used anymore after being stopped
   */
  stop(): void {
    // Stop the API server if running
    if (!this._server) {
      console.log(`INF:apiserver:Stopped`);
      return;
    }
    this._server.close(() => {
      console.log(`INF:apiserver:Stopped`);
    });
  }

  /**
   * Handles a 404 Not Found.
   * @param req the HTTP request
   * @param res the HTTP response
   */
  _notFound(req: express.Request, res: express.Response): void {
    res.status(404).end();
  }

  /**
   * Handles a 500 Internal Server Error.
   * @param req the HTTP request
   * @param res the HTTP response
   */
  _internalServerError(err: unknown, req: express.Request, res: express.Response, next: express.NextFunction): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    console.error(`ERR:apiserver:${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    res.status(500).end();
  }
}
