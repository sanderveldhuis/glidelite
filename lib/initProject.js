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
const node_path_1 = require("node:path");
const sysUtils_1 = require("./sysUtils");
const types_1 = require("./types");
/**
 * Initializes a new GlideLite project at the specified working directory.
 * @param workingDirectory the working directory to create the new project at
 */
function initProject(workingDirectory) {
    const glConfig = (0, node_path_1.join)(workingDirectory, 'glconfig.json');
    const backendDir = (0, node_path_1.join)(workingDirectory, 'backend');
    const apiDir = (0, node_path_1.join)(backendDir, 'api');
    const apiTsConfig = (0, node_path_1.join)(apiDir, 'tsconfig.json');
    const apiMiddlewareDir = (0, node_path_1.join)(apiDir, 'middleware');
    const apiMiddlewareKeep = (0, node_path_1.join)(apiMiddlewareDir, '.gitkeep');
    const apiRoutersDir = (0, node_path_1.join)(apiDir, 'routers');
    const apiRoutersKeep = (0, node_path_1.join)(apiRoutersDir, '.gitkeep');
    const workersDir = (0, node_path_1.join)(backendDir, 'workers');
    const workersTsConfig = (0, node_path_1.join)(workersDir, 'tsconfig.json');
    const frontendDir = (0, node_path_1.join)(workingDirectory, 'frontend');
    const frontendViteConfig = (0, node_path_1.join)(frontendDir, 'vite.config.ts');
    const frontendIndex = (0, node_path_1.join)(frontendDir, 'index.html');
    const frontendPublicDir = (0, node_path_1.join)(frontendDir, 'public');
    const frontend404 = (0, node_path_1.join)(frontendPublicDir, '404.html');
    const frontend429 = (0, node_path_1.join)(frontendPublicDir, '429.html');
    const frontend500 = (0, node_path_1.join)(frontendPublicDir, '500.html');
    // Check if all required files are not yet available to prevent overwriting existing user data
    if ((0, sysUtils_1.exists)(glConfig)) {
        console.error(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}:`, `A 'glconfig.json' file already defined at: '${glConfig}'.`);
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(apiTsConfig)) {
        console.error(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}:`, `A 'tsconfig.json' file already defined at: '${apiTsConfig}'.`);
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(workersTsConfig)) {
        console.error(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}:`, `A 'tsconfig.json' file already defined at: '${workersTsConfig}'.`);
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(frontendViteConfig)) {
        console.error(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}:`, `A 'vite.config.ts' file already defined at: '${frontendViteConfig}'.`);
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(frontendIndex)) {
        console.error(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}:`, `A 'index.html' file already defined at: '${frontendIndex}'.`);
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(frontend404)) {
        console.error(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}:`, `A '404.html' file already defined at: '${frontend404}'.`);
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(frontend429)) {
        console.error(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}:`, `A '429.html' file already defined at: '${frontend429}'.`);
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(frontend500)) {
        console.error(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}:`, `A '500.html' file already defined at: '${frontend500}'.`);
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    // Create the file system structure if not exists, and create all required files
    (0, sysUtils_1.makeFile)(glConfig, '{\n}\n');
    (0, sysUtils_1.makeDir)(apiDir);
    (0, sysUtils_1.makeFile)(apiTsConfig, '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
    (0, sysUtils_1.makeDir)(apiMiddlewareDir);
    (0, sysUtils_1.makeFile)(apiMiddlewareKeep, '');
    (0, sysUtils_1.makeDir)(apiRoutersDir);
    (0, sysUtils_1.makeFile)(apiRoutersKeep, '');
    (0, sysUtils_1.makeDir)(workersDir);
    (0, sysUtils_1.makeFile)(workersTsConfig, '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
    (0, sysUtils_1.makeDir)(frontendDir);
    (0, sysUtils_1.makeFile)(frontendViteConfig, "import react from '@vitejs/plugin-react';\nimport { defineConfig } from 'vite';\n\n// https://vite.dev/config/\nexport default defineConfig({\n  plugins: [react()]\n});\n");
    (0, sysUtils_1.makeFile)(frontendIndex, '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>GlideLite · An end-to-end CLI for modern web apps</title>\n  </head>\n  <body>\n    Welcome to GlideLite!\n  </body>\n</html>\n');
    (0, sysUtils_1.makeDir)(frontendPublicDir);
    (0, sysUtils_1.makeFile)(frontend404, '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>404 Not Found · GlideLite</title>\n  </head>\n  <body>\n    Not found!\n  </body>\n</html>\n');
    (0, sysUtils_1.makeFile)(frontend429, '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>429 Too Many Requests · GlideLite</title>\n  </head>\n  <body>\n    Too Many Requests!\n  </body>\n</html>\n');
    (0, sysUtils_1.makeFile)(frontend500, '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>500 Internal Server Error · GlideLite</title>\n  </head>\n  <body>\n    Internal Server Error!\n  </body>\n</html>\n');
    console.log(`Created a new GlideLite project at: '${workingDirectory}'.`);
}
