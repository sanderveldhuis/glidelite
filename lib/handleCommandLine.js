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
exports.handleCommandLine = handleCommandLine;
const node_path_1 = require("node:path");
const compileFrontend = __importStar(require("./compileFrontend"));
const compileProject = __importStar(require("./compileProject"));
const compileWorkers = __importStar(require("./compileWorkers"));
const initProject_1 = require("./initProject");
const printHelp_1 = require("./printHelp");
const printVersion_1 = require("./printVersion");
const sysUtils_1 = require("./sysUtils");
const types_1 = require("./types");
/**
 * Mapping of module names to their dedicated compiler.
 */
const moduleNameMap = new Map([
    ['workers', compileWorkers],
    ['frontend', compileFrontend],
    ['', compileProject]
]);
/**
 * Handles the specified command by executing the related action.
 * @param command the command to execute
 */
function handleCommandLine(command) {
    if (command.options.version) {
        (0, printVersion_1.printVersion)();
        return process.exit(types_1.ExitStatus.Success);
    }
    if (command.options.help) {
        (0, printHelp_1.printHelp)();
        return process.exit(types_1.ExitStatus.Success);
    }
    const workingDirectory = process.cwd();
    if (command.options.init) {
        (0, initProject_1.initProject)(workingDirectory);
        return process.exit(types_1.ExitStatus.Success);
    }
    const moduleName = String(command.options.module || '');
    const module = moduleNameMap.get(moduleName);
    if (module) {
        const outdir = String(command.options.outdir || 'output');
        const pkgJson = (0, node_path_1.join)(workingDirectory, 'package.json');
        const glConfig = (0, node_path_1.join)(workingDirectory, 'glconfig.json');
        // Resolve output directory path and read JSON configuration files
        const outputDirectory = (0, node_path_1.resolve)(outdir);
        const pkg = (0, sysUtils_1.readJsonFile)(pkgJson);
        const config = (0, sysUtils_1.readJsonFile)(glConfig);
        // If no name, version, and/or homepage is defined in the GlideLite configuration then use the ones from the package.json
        config.name = config.name ?? pkg.name;
        config.version = config.version ?? pkg.version;
        if (config.homepage ?? pkg.homepage) {
            config.homepage = config.homepage ?? pkg.homepage;
        }
        if (command.options.clean) {
            module.clean(pkg, config, outputDirectory);
        }
        module.validate(pkg, config, workingDirectory);
        module.compile(pkg, config, workingDirectory, outputDirectory);
        return process.exit(types_1.ExitStatus.Success);
    }
    else {
        console.error(`error GL${String(types_1.ExitStatus.CommandLineArgumentInvalid)}:`, `Compiler for module '${String(command.options.module)}' not implemented.`);
        return process.exit(types_1.ExitStatus.CommandLineArgumentInvalid);
    }
}
