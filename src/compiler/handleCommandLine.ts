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

import {
  join,
  resolve
} from 'node:path';
import * as compileProject from './compileProject';
import * as compileWorkers from './compileWorkers';
import { initProject } from './initProject';
import { printHelp } from './printHelp';
import { printVersion } from './printVersion';
import { readJsonFile } from './sysUtils';
import {
  Command,
  Compiler,
  ExitStatus
} from './types';

type ModuleNameMap = Map<string, Compiler>;

const moduleNameMap: ModuleNameMap = new Map<string, Compiler>([
  ['workers', compileWorkers],
  ['', compileProject]
]);

export function handleCommandLine(command: Command): void {
  if (command.options.version) {
    printVersion();
    process.exit(ExitStatus.Success);
  }
  else if (command.options.help) {
    printHelp();
    process.exit(ExitStatus.Success);
  }
  else {
    const workingDirectory = process.cwd();

    if (command.options.init) {
      initProject(workingDirectory);
      process.exit(ExitStatus.Success);
    }
    else {
      const moduleName = String(command.options.module || '');
      const module = moduleNameMap.get(moduleName);

      if (module) {
        const outputDirectory = resolve(String(command.options.outdir || 'output'));
        const pkg = readJsonFile(join(workingDirectory, 'package.json'));
        const config = readJsonFile(join(workingDirectory, 'glconfig.json'));
        config.name = config.name ?? pkg.name;
        config.version = config.version ?? pkg.version;

        if (command.options.clean) module.clean(pkg, config, outputDirectory);
        module.validate(pkg, config, workingDirectory);
        module.compile(pkg, config, workingDirectory, outputDirectory);
        process.exit(ExitStatus.Success);
      }
      else {
        console.error(`error GL${String(ExitStatus.CommandLineArgumentInvalid)}:`, `Compiler for module '${String(command.options.module)}' not implemented.`);
        process.exit(ExitStatus.CommandLineArgumentInvalid);
      }
    }
  }
}
