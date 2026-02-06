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
  exists,
  remove
} from './sysUtils';
import {
  ExitStatus,
  Json
} from './types';

const restartDelay = 1000;

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
  let child: ChildProcess | undefined;
  let restartTimeout: NodeJS.Timeout;

  // Get the port from the config
  let port = '';
  if (
    'ports' in config && typeof config.ports === 'object' && config.ports !== null &&
    'api' in config.ports && typeof config.ports.api === 'number'
  ) {
    port = String(config.ports.api);
  }

  // Internal function to start running the API server
  const runApiServer = () => {
    child = spawn(`npm exec -- ts-node ${glideliteApiJs} ${port}`, { shell: true, cwd: workingDirectory, stdio: 'inherit' });
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
  // TODO
  console.log(outputDirectory);

  // TODO: can we add a feature to make workers scalable via GlideLite
  // TODO: create crontab for each instance that should be running
  // crontab += `@reboot root node /opt/${config.name as string}/node_modules/glidelite/lib/api.js {portnumber} >> /var/log/${config.name as string}/api.log &\n`;
  // crontab += `* * * * * root ps aux | grep -v grep | grep -c "node /opt/${config.name as string}/node_modules/glidelite/lib/api.js {portnumber}" || node /opt/${config.name as string}/node_modules/glidelite/lib/api.js {portnumber} >> /var/log/${config.name as string}/api.log &\n`;
}
