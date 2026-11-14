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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProject = initProject;
const node_path_1 = require("node:path");
const picocolors_1 = __importDefault(require("picocolors"));
const sysUtils_1 = require("./sysUtils");
const types_1 = require("./types");
/**
 * Initializes a new GlideLite project at the specified working directory.
 * @param workingDirectory the working directory to create the new project at
 */
function initProject(workingDirectory) {
    const glConfig = (0, node_path_1.join)(workingDirectory, 'glconfig.json');
    const tsConfig = (0, node_path_1.join)(workingDirectory, 'tsconfig.json');
    const backendDir = (0, node_path_1.join)(workingDirectory, 'backend');
    const apiDir = (0, node_path_1.join)(backendDir, 'api');
    const apiMiddlewareDir = (0, node_path_1.join)(apiDir, 'middleware');
    const apiMiddlewareKeep = (0, node_path_1.join)(apiMiddlewareDir, '.gitkeep');
    const apiRoutersDir = (0, node_path_1.join)(apiDir, 'routers');
    const apiRoutersKeep = (0, node_path_1.join)(apiRoutersDir, '.gitkeep');
    const workersDir = (0, node_path_1.join)(backendDir, 'workers');
    const workersKeep = (0, node_path_1.join)(workersDir, '.gitkeep');
    const frontendDir = (0, node_path_1.join)(workingDirectory, 'frontend');
    const frontendViteConfig = (0, node_path_1.join)(frontendDir, 'vite.config.ts');
    const frontendTsConfig = (0, node_path_1.join)(frontendDir, 'tsconfig.json');
    const frontendAppTsConfig = (0, node_path_1.join)(frontendDir, 'tsconfig.app.json');
    const frontendNodeTsConfig = (0, node_path_1.join)(frontendDir, 'tsconfig.node.json');
    const frontendIndex = (0, node_path_1.join)(frontendDir, 'index.html');
    const frontendPublicDir = (0, node_path_1.join)(frontendDir, 'public');
    const frontendPublicKeep = (0, node_path_1.join)(frontendPublicDir, '.gitkeep');
    const sharedDir = (0, node_path_1.join)(workingDirectory, 'shared');
    const sharedKeep = (0, node_path_1.join)(sharedDir, '.gitkeep');
    // Check if all required files are not yet available to prevent overwriting existing user data
    if ((0, sysUtils_1.exists)(glConfig)) {
        console.error(picocolors_1.default.red(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}: A 'glconfig.json' file already defined at: '${glConfig}'.`));
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(tsConfig)) {
        console.error(picocolors_1.default.red(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}: A 'tsconfig.json' file already defined at: '${tsConfig}'.`));
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(frontendViteConfig)) {
        console.error(picocolors_1.default.red(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}: A 'vite.config.ts' file already defined at: '${frontendViteConfig}'.`));
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(frontendTsConfig)) {
        console.error(picocolors_1.default.red(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}: A 'tsconfig.json' file already defined at: '${frontendTsConfig}'.`));
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(frontendAppTsConfig)) {
        console.error(picocolors_1.default.red(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}: A 'tsconfig.app.json' file already defined at: '${frontendAppTsConfig}'.`));
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(frontendNodeTsConfig)) {
        console.error(picocolors_1.default.red(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}: A 'tsconfig.node.json' file already defined at: '${frontendNodeTsConfig}'.`));
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    if ((0, sysUtils_1.exists)(frontendIndex)) {
        console.error(picocolors_1.default.red(`error GL${String(types_1.ExitStatus.FileAlreadyExists)}: A 'index.html' file already defined at: '${frontendIndex}'.`));
        return process.exit(types_1.ExitStatus.FileAlreadyExists);
    }
    // Create the file system structure if not exists, and create all required files
    (0, sysUtils_1.makeFile)(glConfig, '{\n}\n');
    (0, sysUtils_1.makeFile)(tsConfig, '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["backend/**/*", "shared/**/*"]\n}\n');
    (0, sysUtils_1.makeDir)(backendDir);
    (0, sysUtils_1.makeDir)(apiMiddlewareDir);
    (0, sysUtils_1.makeFile)(apiMiddlewareKeep, '');
    (0, sysUtils_1.makeDir)(apiRoutersDir);
    (0, sysUtils_1.makeFile)(apiRoutersKeep, '');
    (0, sysUtils_1.makeDir)(workersDir);
    (0, sysUtils_1.makeFile)(workersKeep, '');
    (0, sysUtils_1.makeDir)(frontendDir);
    (0, sysUtils_1.makeFile)(frontendViteConfig, "import react from '@vitejs/plugin-react';\nimport { glConfig } from 'glidelite/vite';\nimport { defineConfig } from 'vite';\n\n// https://vite.dev/config/\nexport default defineConfig({\n  ...glConfig,\n  plugins: [react()]\n});\n");
    (0, sysUtils_1.makeFile)(frontendTsConfig, '{\n  "files": [],\n  "references": [\n    { "path": "./tsconfig.app.json" },\n    { "path": "./tsconfig.node.json" }\n  ]\n}\n');
    (0, sysUtils_1.makeFile)(frontendAppTsConfig, '{\n  "compilerOptions": {\n    "target": "es2023",\n    "lib": ["ES2023", "DOM"],\n    "module": "esnext",\n    "types": ["vite/client"],\n    "allowArbitraryExtensions": true,\n    "skipLibCheck": true,\n\n    /* Bundler mode */\n    "moduleResolution": "bundler",\n    "allowImportingTsExtensions": true,\n    "verbatimModuleSyntax": true,\n    "moduleDetection": "force",\n    "noEmit": true,\n    "jsx": "react-jsx",\n\n    /* Linting */\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "erasableSyntaxOnly": true,\n    "noFallthroughCasesInSwitch": true\n  },\n  "include": ["src"]\n}\n');
    (0, sysUtils_1.makeFile)(frontendNodeTsConfig, '{\n  "compilerOptions": {\n    "target": "es2023",\n    "lib": ["ES2023"],\n    "types": ["node"],\n    "skipLibCheck": true,\n\n    /* Bundler mode */\n    "module": "nodenext",\n    "allowImportingTsExtensions": true,\n    "verbatimModuleSyntax": true,\n    "moduleDetection": "force",\n    "noEmit": true,\n\n    /* Linting */\n    "noUnusedLocals": true,\n    "noUnusedParameters": true,\n    "erasableSyntaxOnly": true,\n    "noFallthroughCasesInSwitch": true\n  },\n  "include": ["vite.config.ts"]\n}\n');
    (0, sysUtils_1.makeFile)(frontendIndex, '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>GlideLite · An end-to-end CLI for modern web apps</title>\n  </head>\n  <body>\n    Welcome to GlideLite!\n  </body>\n</html>\n');
    (0, sysUtils_1.makeDir)(frontendPublicDir);
    (0, sysUtils_1.makeFile)(frontendPublicKeep, '');
    (0, sysUtils_1.makeDir)(sharedDir);
    (0, sysUtils_1.makeFile)(sharedKeep, '');
    console.log(`Created a new GlideLite project at: '${workingDirectory}'.`);
}
