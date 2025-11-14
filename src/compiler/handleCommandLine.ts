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
import * as compileFrontend from './compileFrontend';
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

type ModuleNameCompilerMap = Map<string, Compiler>;

/**
 * Mapping of module names to their dedicated compiler.
 */
const moduleNameMap: ModuleNameCompilerMap = new Map<string, Compiler>([
  ['workers', compileWorkers],
  ['frontend', compileFrontend],
  ['', compileProject]
]);

/**
 * Handles the specified command by executing the related action.
 * @param command the command to execute
 */
export function handleCommandLine(command: Command): void {
  if (command.options.version) {
    printVersion();
    return process.exit(ExitStatus.Success);
  }
  if (command.options.help) {
    printHelp();
    return process.exit(ExitStatus.Success);
  }

  const workingDirectory = process.cwd();

  if (command.options.init) {
    initProject(workingDirectory);
    return process.exit(ExitStatus.Success);
  }

  const moduleName = String(command.options.module || '');
  const module = moduleNameMap.get(moduleName);

  if (module) {
    const outdir = String(command.options.outdir || 'output');
    const pkgJson = join(workingDirectory, 'package.json');
    const glConfig = join(workingDirectory, 'glconfig.json');

    // Resolve output directory path and read JSON configuration files
    const outputDirectory = resolve(outdir);
    const pkg = readJsonFile(pkgJson);
    const config = readJsonFile(glConfig);

    // If no name and/or version is defined in the GlideLite configuration then use the ones from the package.json
    config.name = config.name ?? pkg.name;
    config.version = config.version ?? pkg.version;

    if (command.options.clean) {
      module.clean(pkg, config, outputDirectory);
    }
    module.validate(pkg, config, workingDirectory);
    module.compile(pkg, config, workingDirectory, outputDirectory);
    return process.exit(ExitStatus.Success);
  }
  else {
    console.error(`error GL${String(ExitStatus.CommandLineArgumentInvalid)}:`, `Compiler for module '${String(command.options.module)}' not implemented.`);
    return process.exit(ExitStatus.CommandLineArgumentInvalid);
  }
}
