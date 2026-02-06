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

import {
  readdirSync,
  readFileSync
} from 'node:fs';
import { join } from 'node:path';

/**
 * Checks whether the specified file contains a valid compiler instruction.
 * @param filePath the file path
 * @returns `true` when the file is a router file, or `false` otherwise
 */
function isRouterFile(filePath: string): boolean {
  // Check if the file is a TypeScript file
  if (!filePath.endsWith('.ts')) {
    return false;
  }

  // Read the TypeScript file content
  const content = readFileSync(filePath).toString();

  // Check whether compiler instruction is available
  return new RegExp(/["']glc router["']/).exec(content) !== null;
}

/**
 * Search and dynamically import all Express routers.
 * @details this function will search directories recursively
 * @param dir the directory to search through
 * @returns dynamically imported Express routers as `Promise`
 */
function dynamicImportRouters(dir: string): Promise<any>[] { // eslint-disable-line @typescript-eslint/no-explicit-any
  let promisses: Promise<any>[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Parse all files and directories in the current directory
  const dirents = readdirSync(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const filePath = join(dir, dirent.name);

    // Recursive search through directories
    if (dirent.isDirectory()) {
      const importPromisses = dynamicImportRouters(filePath);
      promisses = promisses.concat(importPromisses);
      continue;
    }

    // Dynamically import the file if it contains an Express router
    if (isRouterFile(filePath)) {
      const promise = import(process.platform === 'win32' ? `file://${filePath}` : filePath);
      promisses.push(promise);
    }
  }

  return promisses;
}

export default dynamicImportRouters;
