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

import { readdirSync } from 'node:fs';
import {
  dirname,
  join
} from 'node:path';
import dynamicImportRouters from './apiDynamicImporter';
import { ApiServer } from './apiServer';

// Construct API Server
const apiServer = new ApiServer();

// Gracefully shutdown
process.on('SIGINT', () => {
  apiServer.stop();
});

// Search for the API directory in an upwards lookup
let apiDir = '';
for (let dir = __dirname;; dir = dirname(dir)) {
  const files = readdirSync(dir);

  // Search for the API directory
  if (files.includes('api')) {
    apiDir = join(dir, 'api');
    break;
  }

  // In development mode we expect the API directory to be found in the backend directory
  if (files.includes('backend')) {
    const backendDir = join(dir, 'backend');
    if (readdirSync(backendDir).includes('api')) {
      apiDir = join(backendDir, 'api');
      break;
    }
  }

  // Stop if the root directory is reached
  if (dir === dirname(dir)) {
    throw new Error('No API directory available');
  }
}

// Dynamically import Express routers
const dynamicImports = dynamicImportRouters(apiDir);

// Start the API Server once all dynamic imports are finished
Promise.all(dynamicImports).then(routers => {
  const port = process.argv.length < 3 ? 9002 : Number(process.argv[2]);
  apiServer.start(port, routers);
}).catch((err: unknown) => {
  console.error(`ERR:apiserver:${err instanceof Error ? err.message : 'An unknown error occurred'}`);
});
