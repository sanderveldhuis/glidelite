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
import { statSync } from 'node:fs';
import {
  dirname,
  join
} from 'node:path';
import { type WebSocketEndpoint } from '../glidelite/backend/websocket';
import { WsServer } from './wsServer';

/**
 * The tag used by the WebSocket server to detect socket definitions, a registered symbol is used so detection also works
 * when multiple copies of this module are loaded.
 */
const SOCKET_TAG = Symbol.for('glidelite.websocket');

/**
 * Checks whether the specified object is a WebSocket definition.
 * @param obj the object
 * @returns `true` when the object is a WebSocket definition, or `false` otherwise
 */
function isWebSocketDefinition(obj: unknown): obj is WebSocketEndpoint {
  return typeof obj === 'object' && obj !== null && (obj as Record<symbol, unknown>)[SOCKET_TAG] === true;
}

// Search for the WebSocket directory in an upwards lookup
let websocketsDir = '';
for (let dir = __dirname;; dir = dirname(dir)) {
  // Search for the temporary development directory
  websocketsDir = join(dir, 'node_modules', '.tmp', 'glc', 'backend', 'sockets');
  let result = statSync(websocketsDir, { throwIfNoEntry: false });
  if (result?.isDirectory()) {
    break;
  }

  // Search for the WebSocket directory
  websocketsDir = join(dir, 'backend', 'sockets');
  result = statSync(websocketsDir, { throwIfNoEntry: false });
  if (result?.isDirectory()) {
    break;
  }

  // Stop if the root directory is reached
  if (dir === dirname(dir)) {
    throw new Error('No WebSocket directory available');
  }
}

// Import all files from the WebSocket directory
const dynamicImports = directoryImport(websocketsDir);

// Search for all custom WebSocket endpoints
const endpoints: WebSocketEndpoint[] = [];
for (const dynamicImport of Object.values(dynamicImports)) {
  if (typeof dynamicImport === 'object' && dynamicImport !== null) {
    for (const obj of Object.values(dynamicImport)) {
      if (isWebSocketDefinition(obj)) {
        endpoints.push(obj);
      }
    }
  }
}

// Construct WebSocket Server
const wsServer = new WsServer();

// Gracefully shutdown
process.on('SIGINT', () => {
  wsServer.stop();
});

// Start the WebSocket Server
const port = process.argv.length < 3 ? 9003 : Number(process.argv[2]);
wsServer.start(port, endpoints);
