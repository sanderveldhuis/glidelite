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

import { directoryImport } from 'directory-import';
import { RequestHandler } from 'express';
import { statSync } from 'node:fs';
import {
  dirname,
  join
} from 'node:path';
import { ApiServer } from './apiServer';

/**
 * Checks whether the specified object is an Express request handler.
 * @param obj the object
 * @returns `true` when the object is an Express request handler, or `false` otherwise
 */
function isRequestHandler(obj: unknown): obj is RequestHandler {
  return typeof obj === 'function' && obj.name === 'router' && 'stack' in obj;
}

// Search for the API router directory in an upwards lookup
let apiRouterDir = '';
for (let dir = __dirname;; dir = dirname(dir)) {
  // Search for the API router directory
  apiRouterDir = join(dir, 'api', 'router');
  let result = statSync(apiRouterDir, { throwIfNoEntry: false });
  if (result?.isDirectory()) {
    break;
  }

  // In development mode we expect the API router directory to be found in the backend directory
  apiRouterDir = join(dir, 'backend', 'api', 'router');
  result = statSync(apiRouterDir, { throwIfNoEntry: false });
  if (result?.isDirectory()) {
    break;
  }

  // Stop if the root directory is reached
  if (dir === dirname(dir)) {
    throw new Error('No API directory available');
  }
}

// Import all files from the API directory
const dynamicImports = directoryImport(apiRouterDir);

// Search for all custom Express request handlers
const handlers: RequestHandler[] = [];
for (const dynamicImport of Object.values(dynamicImports)) {
  if (typeof dynamicImport === 'object' && dynamicImport !== null) {
    for (const obj of Object.values(dynamicImport)) {
      if (isRequestHandler(obj)) {
        handlers.push(obj);
      }
    }
  }
}

// Construct API Server
const apiServer = new ApiServer();

// Gracefully shutdown
process.on('SIGINT', () => {
  apiServer.stop();
});

// Start the API Server
const port = process.argv.length < 3 ? 9002 : Number(process.argv[2]);
apiServer.start(port, handlers);
