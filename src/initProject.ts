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
  existsSync,
  mkdirSync,
  writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import { ExitStatus } from './types';

function mkdir(path: string): boolean {
  try {
    mkdirSync(path, { recursive: true });
    return true;
  }
  catch (error) {
    console.error(`error GL${String(ExitStatus.DirectoryCreationFailed)}:`, `Failed creating directory at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
    return false;
  }
}

function mkfile(path: string, content: string): boolean {
  try {
    writeFileSync(path, content);
    return true;
  }
  catch (error) {
    console.error(`error GL${String(ExitStatus.FileCreationFailed)}:`, `Failed creating file at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
    return false;
  }
}

export function initProject(workingDirectory: string): void {
  const workersDir = join(workingDirectory, 'backend', 'workers');
  const workersGlConfig = join(workingDirectory, 'glconfig.json');
  const workersTsConfig = join(workersDir, 'tsconfig.json');

  if (existsSync(workersGlConfig)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'glconfig.json' file already defined at: '${workersGlConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }
  else if (existsSync(workersTsConfig)) {
    console.error(`error GL${String(ExitStatus.FileAlreadyExists)}:`, `A 'tsconfig.json' file already defined at: '${workersTsConfig}'.`);
    return process.exit(ExitStatus.FileAlreadyExists);
  }

  if (!mkdir(workersDir)) {
    return process.exit(ExitStatus.DirectoryCreationFailed);
  }

  if (
    !mkfile(workersGlConfig, '{}\n') ||
    !mkfile(workersTsConfig, '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n')
  ) {
    return process.exit(ExitStatus.FileCreationFailed);
  }

  console.log(`Created a new GlideLite project at: '${workingDirectory}'.`);
}
