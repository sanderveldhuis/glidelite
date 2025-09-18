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

import { execSync } from 'node:child_process';
import {
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import {
  ExitStatus,
  Json
} from './types';

export function remove(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

export function makeDir(path: string): void {
  try {
    mkdirSync(path, { recursive: true });
  }
  catch (error) {
    console.error(`error GL${String(ExitStatus.DirectoryCreationFailed)}:`, `Failed creating directory at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
    process.exit(ExitStatus.DirectoryCreationFailed);
  }
}

export function makeFile(path: string, content: string): void {
  try {
    writeFileSync(path, content);
  }
  catch (error) {
    console.error(`error GL${String(ExitStatus.FileCreationFailed)}:`, `Failed creating file at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
    process.exit(ExitStatus.FileCreationFailed);
  }
}

export function readFile(path: string): string {
  try {
    return readFileSync(path).toString();
  }
  catch (error) {
    console.error(`error GL${String(ExitStatus.FileReadFailed)}:`, `Failed reading file at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
    process.exit(ExitStatus.FileReadFailed);
  }
}

export function readJsonFile(path: string): Json {
  try {
    return JSON.parse(readFileSync(path).toString()) as Json;
  }
  catch (error) {
    console.error(`error GL${String(ExitStatus.FileReadFailed)}:`, `Failed reading file at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
    process.exit(ExitStatus.FileReadFailed);
  }
}

export function execute(cmd: string, cwd: string): void {
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
  }
  catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
    process.exit(ExitStatus.ProjectCompileFailed);
  }
}
