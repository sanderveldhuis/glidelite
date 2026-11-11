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

import picocolors from 'picocolors';
import { version } from './version';

/**
 * Prints the instructions of how to use the GlideLite Compiler to the console.
 */
export function printHelp(): void {
  console.log('glc: The GlideLite Compiler - Version', version, '\n');

  console.log(`${picocolors.bold('COMMAND LINE FLAGS')}\n`);
  console.log(`     ${picocolors.blue('--help, -h')}  Print this message.\n`);
  console.log(`  ${picocolors.blue('--version, -v')}  Print the compiler's version.\n`);
  console.log(`     ${picocolors.blue('--init, -i')}  Initializes a GlideLite project and creates all required files.\n`);
  console.log(`      ${picocolors.blue('--run, -r')}  Runs a GlideLite project locally for development.\n`);
  console.log(`    ${picocolors.blue('--clean, -c')}  Deletes the output of a project or module before compiling.\n`);
  console.log(`   ${picocolors.blue('--module, -m')}  Select a module to clean and/or compile.`);
  console.log(`        one of:  backend, frontend\n`);
  console.log(`   ${picocolors.blue('--outDir, -o')}  Specify an output directory.\n`);

  console.log(`${picocolors.bold('COMMON COMMANDS')}\n`);
  console.log(picocolors.blue('  glc'));
  console.log('  Compiles the project in the working directory.\n');
  console.log(picocolors.blue('  glc -c'));
  console.log('  Cleans and compiles the project in the working directory.\n');
  console.log(picocolors.blue('  glc -m backend'));
  console.log('  Compiles the backend module in the working directory.\n');
  console.log(picocolors.blue('  glc -c -m backend'));
  console.log('  Cleans and compiles the backend module in the working directory.\n');
  console.log(picocolors.blue('  glc -r'));
  console.log('  Runs the project in the working directory.\n');
  console.log(picocolors.blue('  glc -i'));
  console.log('  Initializes a GlideLite project in the working directory.\n');
}
