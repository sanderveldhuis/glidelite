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
  Dirent,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import {
  ExitStatus,
  Json
} from './types';

export function exists(path: string): boolean {
  return existsSync(path);
}

export function remove(path: string): void {
  // No need to catch the error because the rmSync function will swallow the error
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

export function readDir(path: string): Dirent[] {
  try {
    return readdirSync(path, { withFileTypes: true, recursive: true });
  }
  catch (error) {
    console.error(`error GL${String(ExitStatus.DirectoryReadFailed)}:`, `Failed reading directory at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
    process.exit(ExitStatus.DirectoryReadFailed);
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
    const content = readFileSync(path).toString();
    return JSON.parse(content) as Json;
  }
  catch (error) {
    console.error(`error GL${String(ExitStatus.FileReadFailed)}:`, `Failed reading JSON at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
    process.exit(ExitStatus.FileReadFailed);
  }
}

export function execute(cmd: string, cwd: string): void {
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
  }
  catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
    // No need to log the error to the console because the output of the command will already be logged to the console
    process.exit(ExitStatus.ProjectCompileFailed);
  }
}
