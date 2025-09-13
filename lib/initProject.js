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
exports.initProject = initProject;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const types_1 = require("./types");
function mkdir(path) {
    try {
        (0, node_fs_1.mkdirSync)(path, { recursive: true });
        return true;
    }
    catch (error) {
        console.error(`error GL${String(types_1.ExitStatus.DirectoryCreationFailed)}:`, `Failed creating directory at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
        return false;
    }
}
function mkfile(path, content) {
    try {
        (0, node_fs_1.writeFileSync)(path, content);
        return true;
    }
    catch (error) {
        console.error(`error GL${String(types_1.ExitStatus.FileCreationFailed)}:`, `Failed creating file at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`);
        return false;
    }
}
function initProject(workingDirectory) {
    const workersDir = (0, node_path_1.join)(workingDirectory, 'backend', 'workers');
    const workersGlConfig = (0, node_path_1.join)(workingDirectory, 'glconfig.json');
    const workersTsConfig = (0, node_path_1.join)(workersDir, 'tsconfig.json');
    if ((0, node_fs_1.existsSync)(workersGlConfig)) {
        console.error(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}:`, `A 'glconfig.json' file already defined at: '${workersGlConfig}'.`);
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    else if ((0, node_fs_1.existsSync)(workersTsConfig)) {
        console.error(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}:`, `A 'tsconfig.json' file already defined at: '${workersTsConfig}'.`);
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if (!mkdir(workersDir)) {
        return process.exit(types_1.ExitStatus.DirectoryCreationFailed);
    }
    if (!mkfile(workersGlConfig, '{}\n') ||
        !mkfile(workersTsConfig, '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n')) {
        return process.exit(types_1.ExitStatus.FileCreationFailed);
    }
    console.log(`Created a new GlideLite project at: '${workingDirectory}'.`);
}
//# sourceMappingURL=initProject.js.map