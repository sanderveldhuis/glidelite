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

import { join } from 'node:path';
import {
  exists,
  makeDir,
  makeFile
} from './sysUtils';
import { ExitStatus } from './types';

/**
 * Initializes a new GlideLite project at the specified working directory.
 * @param workingDirectory the working directory to create the new project at
 */
export function initProject(workingDirectory: string): void {
  const workersDir = join(workingDirectory, 'backend', 'workers');
  const workersGlConfig = join(workingDirectory, 'glconfig.json');
  const workersTsConfig = join(workersDir, 'tsconfig.json');
  const frontendDir = join(workingDirectory, 'frontend');
  const frontendViteConfig = join(frontendDir, 'vite.config.js');
  const frontendIndex = join(frontendDir, 'index.html');

  // Check if all required files are not yet available to prevent overwriting existing user data
  if (exists(workersGlConfig)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'glconfig.json' file already defined at: '${workersGlConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(workersTsConfig)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'tsconfig.json' file already defined at: '${workersTsConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(frontendViteConfig)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'vite.config.js' file already defined at: '${frontendViteConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(frontendIndex)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'index.html' file already defined at: '${frontendIndex}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }

  // Create the file system structure if not exists, and create all required files
  makeDir(workersDir);
  makeFile(workersGlConfig, '{}\n');
  makeFile(workersTsConfig, '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
  makeDir(frontendDir);
  makeFile(frontendViteConfig, "import react from '@vitejs/plugin-react';\nimport { defineConfig } from 'vite';\n\n// https://vite.dev/config/\nexport default defineConfig({\n  plugins: [react()]\n});\n");
  makeFile(frontendIndex, '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>GlideLite</title>\n  </head>\n  <body>\n    Welcome to GlideLite!\n  </body>\n</html>\n');

  console.log(`Created a new GlideLite project at: '${workingDirectory}'.`);
}
