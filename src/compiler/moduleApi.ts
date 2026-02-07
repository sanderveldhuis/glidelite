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
  ChildProcess,
  spawn
} from 'node:child_process';
import { watch } from 'node:fs';
import { join } from 'node:path';
import {
  execute,
  exists,
  makeDir,
  makeFile,
  remove
} from './sysUtils';
import {
  ExitStatus,
  Json
} from './types';

const restartDelay = 1000;

/**
 * Searches for the API port in the GlideLite configuration.
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @returns the `string` representation of the API port
 */
function getApiPort(config: Json): string {
  if (
    'ports' in config && typeof config.ports === 'object' && config.ports !== null &&
    'api' in config.ports && typeof config.ports.api === 'number'
  ) {
    return ` ${String(config.ports.api)}`;
  }
  return '';
}

/**
 * Cleans the API output data from the specified output directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param outputDirectory the output directory to be cleaned
 */
export function clean(pkg: Json, config: Json, outputDirectory: string): void {
  remove(join(outputDirectory, 'opt', config.name as string, 'api'));
}

/**
 * Validates the API input data in the specified working directory to ensure everything is present for running the compilation.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be validated
 */
export function validate(pkg: Json, config: Json, workingDirectory: string): void {
  const apiTsConfig = join(workingDirectory, 'backend', 'api', 'tsconfig.json');
  const glideliteApiJs = join(workingDirectory, 'node_modules', 'glidelite', 'lib', 'api.js');

  if (!exists(apiTsConfig)) {
    console.error(`error GL${String(ExitStatus.ProjectInvalid)}:`, `No valid project found at: '${workingDirectory}', missing file '${apiTsConfig}'.`);
    return process.exit(ExitStatus.ProjectInvalid);
  }
  if (!exists(glideliteApiJs)) {
    console.error(`error GL${String(ExitStatus.ProjectInvalid)}:`, `No valid GlideLite dependency found at: '${workingDirectory}', missing file '${glideliteApiJs}'.`);
    return process.exit(ExitStatus.ProjectInvalid);
  }
}

/**
 * Runs the API input data at the specified working directory for development.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be run
 */
export function run(pkg: Json, config: Json, workingDirectory: string): void {
  const apiDir = join(workingDirectory, 'backend', 'api');
  const glideliteApiJs = join(workingDirectory, 'node_modules', 'glidelite', 'lib', 'api.js');
  const port = getApiPort(config);
  let child: ChildProcess | undefined;
  let restartTimeout: NodeJS.Timeout;

  // Internal function to start running the API server
  const runApiServer = () => {
    child = spawn(`npm exec -- ts-node ${glideliteApiJs}${port}`, { shell: true, cwd: workingDirectory, stdio: 'inherit' });
  };

  // Start running the API server
  runApiServer();

  // Watch for changes in files and restart workers when files changed
  const watcher = watch(apiDir, { recursive: true });
  watcher.on('change', () => {
    // Use a delay to prevent restarting too much
    clearTimeout(restartTimeout);
    restartTimeout = setTimeout(() => {
      if (child !== undefined) {
        if ('win32' === process.platform) {
          spawn('taskkill', ['/pid', String(child.pid), '/f', '/t']);
        }
        else {
          spawn('sh', ['-c', `kill -9 ${String(child.pid)}`]);
        }
      }
      runApiServer();
    }, restartDelay);
  });
}

/**
 * Compiles the API input data in the specified working directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be compiled
 * @param outputDirectory the output directory where to put the compilation results in
 */
export function compile(pkg: Json, config: Json, workingDirectory: string, outputDirectory: string): void {
  const apiDir = join(workingDirectory, 'backend', 'api');
  const outputDir = join(outputDirectory, 'opt', config.name as string, 'api');
  const port = getApiPort(config);

  // Compile the TypeScript files
  if (execute(`npm exec -- tsc -p ${apiDir} --rootDir ${apiDir} --outDir ${outputDir}`, workingDirectory)) {
    // Write Crontab file
    const cronDir = join(outputDirectory, 'etc', 'cron.d');
    const cronFile = join(cronDir, `${config.name as string}_api`);
    makeDir(cronDir);
    makeFile(
      cronFile,
      `@reboot root node /opt/${config.name as string}/node_modules/glidelite/lib/api.js${port} >> /var/log/${config.name as string}/api.log &\n` +
        `* * * * * root ps aux | grep -v grep | grep -c "node /opt/${config.name as string}/node_modules/glidelite/lib/api.js${port}" || node /opt/${config.name as string}/node_modules/glidelite/lib/api.js${port} >> /var/log/${config.name as string}/api.log &\n`
    );
  }
  else {
    process.exit(ExitStatus.ProjectCompileFailed);
  }
}
