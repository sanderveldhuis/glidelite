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
  const frontendViteConfig = join(frontendDir, 'vite.config.ts');
  const frontendIndex = join(frontendDir, 'index.html');
  const frontend404 = join(frontendDir, 'public', '404.html');
  const frontend429 = join(frontendDir, 'public', '429.html');
  const frontend500 = join(frontendDir, 'public', '500.html');

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
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'vite.config.ts' file already defined at: '${frontendViteConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(frontendIndex)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'index.html' file already defined at: '${frontendIndex}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(frontend404)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A '404.html' file already defined at: '${frontend404}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(frontend429)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A '429.html' file already defined at: '${frontend429}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  if (exists(frontend500)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A '500.html' file already defined at: '${frontend500}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }

  // Create the file system structure if not exists, and create all required files
  makeDir(workersDir);
  makeFile(workersGlConfig, '{}\n');
  makeFile(workersTsConfig, '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
  makeDir(frontendDir);
  makeFile(frontendViteConfig, "import react from '@vitejs/plugin-react';\nimport { defineConfig } from 'vite';\n\n// https://vite.dev/config/\nexport default defineConfig({\n  plugins: [react()]\n});\n");
  makeFile(frontendIndex, '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>GlideLite · An end-to-end CLI for modern web apps</title>\n  </head>\n  <body>\n    Welcome to GlideLite!\n  </body>\n</html>\n');
  makeFile(frontend404, '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>404 Not Found · GlideLite</title>\n  </head>\n  <body>\n    Not found!\n  </body>\n</html>\n');
  makeFile(frontend429, '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>429 Too Many Requests · GlideLite</title>\n  </head>\n  <body>\n    Too Many Requests!\n  </body>\n</html>\n');
  makeFile(frontend500, '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>500 Internal Server Error · GlideLite</title>\n  </head>\n  <body>\n    Internal Server Error!\n  </body>\n</html>\n');

  console.log(`Created a new GlideLite project at: '${workingDirectory}'.`);
}
