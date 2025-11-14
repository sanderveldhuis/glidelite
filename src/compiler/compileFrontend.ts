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

import { join } from 'node:path';
import {
  execute,
  exists,
  remove
} from './sysUtils';
import {
  ExitStatus,
  Json
} from './types';

/**
 * Cleans the frontend output data from the specified output directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param outputDirectory the output directory to be cleaned
 */
export function clean(pkg: Json, config: Json, outputDirectory: string): void {
  remove(join(outputDirectory, 'var', 'www', config.name as string));
}

/**
 * Validates the frontend input data in the specified working directory to ensure everything is present for running the compilation.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be validated
 */
export function validate(pkg: Json, config: Json, workingDirectory: string): void {
  const viteConfig = join(workingDirectory, 'frontend', 'vite.config.js');

  if (!exists(viteConfig)) {
    console.error(`error GL${String(ExitStatus.ProjectInvalid)}:`, `No valid project found at: '${workingDirectory}', missing file '${viteConfig}'.`);
    return process.exit(ExitStatus.ProjectInvalid);
  }
}

/**
 * Compiles the frontend input data in the specified working directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be compiled
 * @param outputDirectory the output directory where to put the compilation results in
 */
export function compile(pkg: Json, config: Json, workingDirectory: string, outputDirectory: string): void {
  const frontendDir = join(workingDirectory, 'frontend');
  const outputDir = join(outputDirectory, 'var', 'www', config.name as string);

  // Compile the frontend
  execute(`vite build --outDir ${outputDir} --emptyOutDir`, frontendDir);
}
