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
exports.printHelp = printHelp;
const color_1 = require("./color");
const version_1 = require("./version");
/**
 * Prints the instructions of how to use the GlideLite Compiler to the console.
 */
function printHelp() {
    console.log('glc: The GlideLite Compiler - Version', version_1.version, '\n');
    console.log(`${(0, color_1.bold)('COMMAND LINE FLAGS')}\n`);
    console.log(`     ${(0, color_1.blue)('--help, -h')}  Print this message.\n`);
    console.log(`  ${(0, color_1.blue)('--version, -v')}  Print the compiler's version.\n`);
    console.log(`     ${(0, color_1.blue)('--init, -i')}  Initializes a GlideLite project and creates all required files.\n`);
    console.log(`      ${(0, color_1.blue)('--run, -r')}  Runs a GlideLite project locally for development.\n`);
    console.log(`    ${(0, color_1.blue)('--clean, -c')}  Deletes the output of a project or module before compiling.\n`);
    console.log(`   ${(0, color_1.blue)('--module, -m')}  Select a module to clean and/or compile.`);
    console.log(`        one of:  workers, api, backend, frontend\n`);
    console.log(`   ${(0, color_1.blue)('--outDir, -o')}  Specify an output directory.\n`);
    console.log(`${(0, color_1.bold)('COMMON COMMANDS')}\n`);
    console.log((0, color_1.blue)('  glc'));
    console.log('  Compiles the project in the working directory.\n');
    console.log((0, color_1.blue)('  glc -c'));
    console.log('  Cleans and compiles the project in the working directory.\n');
    console.log((0, color_1.blue)('  glc -m workers'));
    console.log('  Compiles the workers module in the working directory.\n');
    console.log((0, color_1.blue)('  glc -c -m workers'));
    console.log('  Cleans and compiles the workers module in the working directory.\n');
    console.log((0, color_1.blue)('  glc -r'));
    console.log('  Runs the project in the working directory.\n');
    console.log((0, color_1.blue)('  glc -i'));
    console.log('  Initializes a GlideLite project in the working directory.\n');
}
