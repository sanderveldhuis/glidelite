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

export type CommandOptions = Record<string, string | boolean>;

export interface Command {
  options: CommandOptions;
  paths: string[];
}

export enum ExitStatus {
  Success = 0,
  CommandLineOptionUnknown = 1001,
  CommandLineArgumentMissing = 1002,
  CommandLineArgumentInvalid = 1003,
  DirectoryCreationFailed = 2001,
  DirectoryReadFailed = 2002,
  FileAlreadyExists = 2010,
  FileCreationFailed = 2011,
  FileReadFailed = 2012,
  ProjectInvalid = 3001,
  ProjectCompileFailed = 3002
}

export type Json = Record<string, string | number | object | boolean | null>;

export interface Compiler {
  clean: (pkg: Json, config: Json, outputDirectory: string) => void;
  validate: (pkg: Json, config: Json, workingDirectory: string) => void;
  run: (pkg: Json, config: Json, workingDirectory: string) => void;
  compile: (pkg: Json, config: Json, workingDirectory: string, outputDirectory: string) => void;
}
