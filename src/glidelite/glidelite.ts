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
import {
  dirname,
  join
} from 'node:path';

/**
 * Search for the glconfig.json file in an upwards lookup.
 */
let glconfigJson = '';
for (let dir = __dirname;; dir = dirname(dir)) {
  // Search for the glconfig.json in the directory
  if (readdirSync(dir).includes('glconfig.json')) {
    glconfigJson = join(dir, 'glconfig.json');
    break;
  }
  // Stop if the root directory is reached
  if (dir === dirname(dir)) {
    throw new Error('No glconfig.json file available');
  }
}

/**
 * The GlideLite configuration loaded from the glconfig.json file.
 */
export const glconfig: any = JSON.parse(readFileSync(glconfigJson).toString()) as object; /* eslint-disable-line @typescript-eslint/no-explicit-any */
