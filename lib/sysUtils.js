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
exports.exists = exists;
exports.remove = remove;
exports.makeDir = makeDir;
exports.makeFile = makeFile;
exports.readDir = readDir;
exports.readFile = readFile;
exports.readJsonFile = readJsonFile;
exports.execute = execute;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const types_1 = require("./types");
/**
 * Checks if the specified file or directory exists.
 * @param path the full path of the file or directory
 * @returns `true` when the file or directory exists, or `false` otherwise
 */
function exists(path) {
    return (0, node_fs_1.existsSync)(path);
}
/**
 * Removes if the specified file or directory.
 * @param path the full path of the file or directory
 */
function remove(path) {
    // No need to catch the error because the function will swallow the error
    (0, node_fs_1.rmSync)(path, { recursive: true, force: true });
}
/**
 * Creates the specified directory and all missing parent directories.
 * @details catches any errors by logging to the console and stopping the process
 * @param path the full path of the directory
 */
function makeDir(path) {
    try {
        (0, node_fs_1.mkdirSync)(path, { recursive: true });
    }
    catch (error) {
        console.error(`error GL${String(types_1.ExitStatus.DirectoryCreationFailed)}:`, `Failed creating directory at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
        process.exit(types_1.ExitStatus.DirectoryCreationFailed);
    }
}
/**
 * Creates the specified file and writes the content to the file.
 * @details catches any errors by logging to the console and stopping the process
 * @param path the full path of the file
 * @param content the content to be written to the created file
 */
function makeFile(path, content) {
    try {
        (0, node_fs_1.writeFileSync)(path, content);
    }
    catch (error) {
        console.error(`error GL${String(types_1.ExitStatus.FileCreationFailed)}:`, `Failed creating file at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
        process.exit(types_1.ExitStatus.FileCreationFailed);
    }
}
/**
 * Lists all files and directories found in the specified directory recursive.
 * @details catches any errors by logging to the console and stopping the process
 * @param path the full path of the directory
 * @returns the list of files and directories found
 */
function readDir(path) {
    try {
        return (0, node_fs_1.readdirSync)(path, { withFileTypes: true, recursive: true });
    }
    catch (error) {
        console.error(`error GL${String(types_1.ExitStatus.DirectoryReadFailed)}:`, `Failed reading directory at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
        process.exit(types_1.ExitStatus.DirectoryReadFailed);
    }
}
/**
 * Reads the content of the the specified file.
 * @details catches any errors by logging to the console and stopping the process
 * @param path the full path of the file
 * @returns the content of the file
 */
function readFile(path) {
    try {
        return (0, node_fs_1.readFileSync)(path).toString();
    }
    catch (error) {
        console.error(`error GL${String(types_1.ExitStatus.FileReadFailed)}:`, `Failed reading file at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
        process.exit(types_1.ExitStatus.FileReadFailed);
    }
}
/**
 * Reads the content of the the specified file as JSON object.
 * @details catches any errors by logging to the console and stopping the process
 * @param path the full path of the JSON file
 * @returns the JSON content of the file
 */
function readJsonFile(path) {
    try {
        const content = (0, node_fs_1.readFileSync)(path).toString();
        return JSON.parse(content);
    }
    catch (error) {
        console.error(`error GL${String(types_1.ExitStatus.FileReadFailed)}:`, `Failed reading JSON at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
        process.exit(types_1.ExitStatus.FileReadFailed);
    }
}
/**
 * Executes the specified command in the working directory.
 * @details catches any errors by logging to the console and stopping the process
 * @details the output of the command is routed to the console
 * @param command the command to be executed
 * @param workingDirectory the working directory where to execute the command
 * @returns `true` when successful, or `false` otherwise
 */
function execute(command, workingDirectory) {
    try {
        (0, node_child_process_1.execSync)(command, { cwd: workingDirectory, stdio: 'inherit' });
    }
    catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        // No need to log the error to the console because the output of the command will already be logged to the console
        return false;
    }
    return true;
}
