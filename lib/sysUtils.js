"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = remove;
exports.makeDir = makeDir;
exports.makeFile = makeFile;
exports.readFile = readFile;
exports.readJsonFile = readJsonFile;
exports.execute = execute;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const types_1 = require("./types");
function remove(path) {
    (0, node_fs_1.rmSync)(path, { recursive: true, force: true });
}
function makeDir(path) {
    try {
        (0, node_fs_1.mkdirSync)(path, { recursive: true });
    }
    catch (error) {
        console.error(`error GL${String(types_1.ExitStatus.DirectoryCreationFailed)}:`, `Failed creating directory at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
        process.exit(types_1.ExitStatus.DirectoryCreationFailed);
    }
}
function makeFile(path, content) {
    try {
        (0, node_fs_1.writeFileSync)(path, content);
    }
    catch (error) {
        console.error(`error GL${String(types_1.ExitStatus.FileCreationFailed)}:`, `Failed creating file at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
        process.exit(types_1.ExitStatus.FileCreationFailed);
    }
}
function readFile(path) {
    try {
        return (0, node_fs_1.readFileSync)(path).toString();
    }
    catch (error) {
        console.error(`error GL${String(types_1.ExitStatus.FileReadFailed)}:`, `Failed reading file at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
        process.exit(types_1.ExitStatus.FileReadFailed);
    }
}
function readJsonFile(path) {
    try {
        return JSON.parse((0, node_fs_1.readFileSync)(path).toString());
    }
    catch (error) {
        console.error(`error GL${String(types_1.ExitStatus.FileReadFailed)}:`, `Failed reading file at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
        process.exit(types_1.ExitStatus.FileReadFailed);
    }
}
function execute(cmd, cwd) {
    try {
        (0, node_child_process_1.execSync)(cmd, { cwd, stdio: 'inherit' });
    }
    catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        process.exit(types_1.ExitStatus.ProjectCompileFailed);
    }
}
