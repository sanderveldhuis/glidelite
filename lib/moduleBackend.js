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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = clean;
exports.validate = validate;
exports.run = run;
exports.compile = compile;
const node_path_1 = require("node:path");
const moduleApi = __importStar(require("./moduleApi"));
const moduleWorkers = __importStar(require("./moduleWorkers"));
const sysUtils_1 = require("./sysUtils");
const types_1 = require("./types");
/**
 * Cleans the backend output data from the specified output directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param outputDirectory the output directory to be cleaned
 */
function clean(pkg, config, outputDirectory) {
    moduleWorkers.clean(pkg, config, outputDirectory);
    moduleApi.clean(pkg, config, outputDirectory);
}
/**
 * Validates the backend input data in the specified working directory to ensure everything is present for running the compilation.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be validated
 */
function validate(pkg, config, workingDirectory) {
    const backendTsConfig = (0, node_path_1.join)(workingDirectory, 'backend', 'tsconfig.json');
    if (!(0, sysUtils_1.exists)(backendTsConfig)) {
        console.error(`error GL${String(types_1.ExitStatus.ProjectInvalid)}:`, `No valid project found at: '${workingDirectory}', missing file '${backendTsConfig}'.`);
        return process.exit(types_1.ExitStatus.ProjectInvalid);
    }
    moduleWorkers.validate(pkg, config, workingDirectory);
    moduleApi.validate(pkg, config, workingDirectory);
}
/**
 * Runs the backend input data at the specified working directory for development.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be run
 */
function run(pkg, config, workingDirectory) {
    moduleWorkers.run(pkg, config, workingDirectory);
    moduleApi.run(pkg, config, workingDirectory);
}
/**
 * Compiles the backend input data in the specified working directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be compiled
 * @param outputDirectory the output directory where to put the compilation results in
 */
function compile(pkg, config, workingDirectory, outputDirectory) {
    const backendDir = (0, node_path_1.join)(workingDirectory, 'backend');
    const outputDir = (0, node_path_1.join)(outputDirectory, 'opt', config.name);
    // Get a list of all TypeScript files
    const allFiles = (0, sysUtils_1.readDir)(backendDir);
    const tsFiles = allFiles.filter(file => new RegExp('.ts$').test(file.name));
    if (tsFiles.length <= 0) {
        // Nothing to compile
        return;
    }
    // Compile the TypeScript files and modules afterwards
    if ((0, sysUtils_1.execute)(`npm exec -- tsc -p ${backendDir} --rootDir ${backendDir} --outDir ${outputDir}`, workingDirectory)) {
        moduleWorkers.compile(pkg, config, workingDirectory, outputDirectory);
        moduleApi.compile(pkg, config, workingDirectory, outputDirectory);
    }
    else {
        process.exit(types_1.ExitStatus.ProjectCompileFailed);
    }
}
