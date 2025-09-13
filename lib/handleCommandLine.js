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
exports.handleCommandLine = handleCommandLine;
const initProject_1 = require("./initProject");
const printHelp_1 = require("./printHelp");
const printVersion_1 = require("./printVersion");
const types_1 = require("./types");
function handleCommandLine(command) {
    if (command.options.version) {
        (0, printVersion_1.printVersion)();
        process.exit(types_1.ExitStatus.Success);
    }
    else if (command.options.help) {
        (0, printHelp_1.printHelp)();
        process.exit(types_1.ExitStatus.Success);
    }
    else {
        const workingDirectory = process.cwd();
        if (command.options.init) {
            (0, initProject_1.initProject)(workingDirectory);
            process.exit(types_1.ExitStatus.Success);
        }
        else {
            process.exit(types_1.ExitStatus.Success);
        }
    }
}
//# sourceMappingURL=handleCommandLine.js.map