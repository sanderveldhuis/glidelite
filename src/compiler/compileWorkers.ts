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
  makeDir,
  makeFile,
  readDir,
  readFile,
  remove
} from './sysUtils';
import {
  ExitStatus,
  Json
} from './types';

const regexMinute = '([1-5]?[0-9])'; // Minute 0-59
const regexMinuteList = '(' + regexMinute + '(-' + regexMinute + '(\\/' + regexMinute + ')?)?)'; // Minute list and range (e.g. 0-4 or 8-12/2)
const regexHour = '(1?[0-9]|2[0-3])'; // Hour 0-23
const regexHourList = '(' + regexHour + '(-' + regexHour + '(\\/' + regexHour + ')?)?)'; // Hour list and range (e.g. 0-4 or 8-12/2)
const dayOfMonth = '([1-9]|[1-2][0-9]|3[0-1])'; // Day of month 1-31
const dayOfMonthList = '(' + dayOfMonth + '(-' + dayOfMonth + '(\\/' + dayOfMonth + ')?)?)'; // Day of month list and range (e.g. 1-10 or 29-31/2)
const month = '([1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)'; // Month 1-12, or first three letters of month
const monthList = '(' + month + '(-' + month + '(\\/' + month + ')?)?)'; // Month list and range (e.g. 1-4 or 8-12/2)
const dayOfWeek = '([0-7]|mon|tue|wed|thu|fri|sat|sun)'; // Day of week 0-7 or first three letters of day
const dayOfWeekList = '(' + dayOfWeek + '(-' + dayOfWeek + '(\\/' + dayOfWeek + ')?)?)'; // Day of week list and range (e.g. 0-4 or 5-7/2)
const any = '(\\*(\\/\\d*)?)'; // Any value and range (e.g. * or */2)
const regex = `["']glc (service|task (` +
  '(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(' + // Allow @annually, @yearly, @monthly, @weekly, @daily, @hourly, @reboot OR the following following:
  '(' + regexMinuteList + '(,' + regexMinuteList + ')*|' + any + ') ' + // Single/list minutes, comma separated minutes, or any value (*)
  '(' + regexHourList + '(,' + regexHourList + ')*|' + any + ') ' + // Single/list hour, comma separated hours, or any value (*)
  '(' + dayOfMonthList + '(,' + dayOfMonthList + ')*|' + any + ') ' + // Single/list day of month, comma separated days of month, or any value (*)
  '(' + monthList + '(,' + monthList + ')*|' + any + ') ' + // Single/list month, comma separated months, or any value (*)
  '(' + dayOfWeekList + '(,' + dayOfWeekList + ')*|' + any + ')' + // Single/list day of week, comma separated days of week, or any value (*)
  `)))["']`;

/**
 * Cleans the workers output data from the specified output directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param outputDirectory the output directory to be cleaned
 */
export function clean(pkg: Json, config: Json, outputDirectory: string): void {
  remove(join(outputDirectory, 'opt', config.name as string, 'workers'));
  remove(join(outputDirectory, 'etc', 'cron.d', `${config.name as string}_workers`));
}

/**
 * Validates the workers input data in the specified working directory to ensure everything is present for running the compilation.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be validated
 */
export function validate(pkg: Json, config: Json, workingDirectory: string): void {
  const workersTsConfig = join(workingDirectory, 'backend', 'workers', 'tsconfig.json');

  if (!exists(workersTsConfig)) {
    console.error(`error GL${String(ExitStatus.ProjectInvalid)}:`, `No valid project found at: '${workingDirectory}', missing file '${workersTsConfig}'.`);
    return process.exit(ExitStatus.ProjectInvalid);
  }
}

/**
 * Compiles the workers input data in the specified working directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be compiled
 * @param outputDirectory the output directory where to put the compilation results in
 */
export function compile(pkg: Json, config: Json, workingDirectory: string, outputDirectory: string): void {
  const workersDir = join(workingDirectory, 'backend', 'workers');
  const outputDir = join(outputDirectory, 'opt', config.name as string, 'workers');

  // Get a list of all TypeScript files
  const allFiles = readDir(workersDir);
  const tsFiles = allFiles.filter(file => new RegExp('.ts$').test(file.name));
  if (tsFiles.length <= 0) {
    // Nothing to compile
    return;
  }

  // Compile the TypeScript files
  execute(`tsc -p ${workersDir} --outDir ${outputDir}`, workingDirectory);

  // Construct Crontab content based on compiler instructions in the TypeScript files
  let crontab = '';
  for (const file of tsFiles) {
    // Read the TypeScript file content
    const filePath = join(file.parentPath, file.name);
    const content = readFile(filePath);

    // Check whether compiler instruction is available
    const gotInstruction = new RegExp(/["']glc .*["']/).exec(content);
    if (gotInstruction === null) {
      continue;
    }

    // Check whether compiler instruction is valid
    const instruction = new RegExp(regex).exec(content);
    if (instruction === null) {
      console.error(`error GL${String(ExitStatus.ProjectCompileFailed)}:`, `Invalid compiler instruction found in: '${filePath}'.`);
      return process.exit(ExitStatus.ProjectCompileFailed);
    }

    // Construct Crontab content for either a task or a service
    const jsFilePath = filePath.replace(workersDir, '').replace(/\\/g, '/').replace(/^\//, '').replace(/.ts$/, '.js');
    if (instruction[1] === 'service') {
      crontab += `@reboot root cd /opt/${config.name as string}/workers && node ${jsFilePath} &\n`;
      crontab += `* * * * * root ps aux | grep -v grep | grep -c "node ${jsFilePath}" || cd /opt/${config.name as string}/workers && node ${jsFilePath} &\n`;
    }
    else {
      crontab += `${instruction[2]} root cd /opt/${config.name as string}/workers && node ${jsFilePath} &\n`;
    }
  }

  // Write all other output files
  const packageFile = join(outputDir, 'package.json');
  const glconfigFile = join(outputDir, 'glconfig.json');
  makeFile(packageFile, JSON.stringify({ name: config.name, version: config.version, dependencies: pkg.dependencies }));
  makeFile(glconfigFile, JSON.stringify(config));
  if (crontab !== '') {
    const cronDir = join(outputDirectory, 'etc', 'cron.d');
    const cronFile = join(cronDir, `${config.name as string}_workers`);
    makeDir(cronDir);
    makeFile(cronFile, crontab);
  }
}
