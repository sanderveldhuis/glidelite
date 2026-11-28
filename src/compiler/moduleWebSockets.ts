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

import { watch } from 'chokidar';
import {
  ChildProcess,
  spawn
} from 'node:child_process';
import {
  dirname,
  join,
  relative
} from 'node:path';
import picocolors from 'picocolors';
import {
  copyFile,
  execute,
  exists,
  makeDir,
  makeFile,
  readDir,
  remove
} from './sysUtils';
import {
  ExitStatus,
  Json
} from './types';

const restartDelay = 1000;

/**
 * Searches for the WebSocket port in the GlideLite configuration.
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @returns the `string` representation of the WebSocket port
 */
function getWebSocketPort(config: Json): string {
  if (
    'ports' in config && typeof config.ports === 'object' && config.ports !== null &&
    'websocket' in config.ports && typeof config.ports.websocket === 'number'
  ) {
    return ` ${String(config.ports.websocket)}`;
  }
  return '';
}

/**
 * Cleans the WebSockets output data from the specified output directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param outputDirectory the output directory to be cleaned
 */
export function clean(pkg: Json, config: Json, outputDirectory: string): void {
  remove(join(outputDirectory, 'opt', config.name as string, 'backend', 'sockets'));
  remove(join(outputDirectory, 'etc', 'cron.d', `${config.name as string}_websockets`));
}

/**
 * Validates the WebSockets input data in the specified working directory to ensure everything is present for running the compilation.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be validated
 */
export function validate(pkg: Json, config: Json, workingDirectory: string): void {
  const websockets = join(workingDirectory, 'backend', 'sockets');
  const glideliteWsJs = join(workingDirectory, 'node_modules', 'glidelite', 'lib', 'wsserver', 'run.js');

  if (!exists(websockets)) {
    console.error(picocolors.red(`error GL${String(ExitStatus.ProjectInvalid)}: No valid project found at: '${workingDirectory}', missing directory '${websockets}'.`));
    return process.exit(ExitStatus.ProjectInvalid);
  }
  if (!exists(glideliteWsJs)) {
    console.error(picocolors.red(`error GL${String(ExitStatus.ProjectInvalid)}: No valid GlideLite dependency found at: '${workingDirectory}', missing file '${glideliteWsJs}'.`));
    return process.exit(ExitStatus.ProjectInvalid);
  }
}

/**
 * Runs the WebSockets input data at the specified working directory for development.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be run
 */
export function run(pkg: Json, config: Json, workingDirectory: string): void {
  const tmpDir = join(workingDirectory, 'node_modules', '.tmp', 'glc', 'ws');
  const backendDir = join(workingDirectory, 'backend');
  const websocketsDir = join(backendDir, 'sockets');
  const sharedDir = join(workingDirectory, 'shared');
  const glideliteWsJs = join(workingDirectory, 'node_modules', 'glidelite', 'lib', 'wsserver', 'run.js');
  const port = getWebSocketPort(config);
  let child: ChildProcess | undefined;
  let restartTimeout: NodeJS.Timeout;

  // Internal function to start running the WebSocket server
  const runWsServer = () => {
    // Because dynamic imports are used the TypeScript files first have to be compiled, JavaScript files can be used as-is

    // Cleanup to prevent running old files
    remove(tmpDir);

    // Read all files in the WebSockets directory
    const allFiles = readDir(websocketsDir);

    // Copy JavaScript files to the temporary directory
    const jsFiles = allFiles.filter(file => file.name.endsWith('.js'));
    for (const file of jsFiles) {
      const filePath = join(file.parentPath, file.name);
      const destPath = join(tmpDir, relative(workingDirectory, filePath));
      makeDir(dirname(destPath));
      copyFile(filePath, destPath);
    }

    // Compile TypeScript files to the temporary directory
    const tsFiles = allFiles.filter(file => file.name.endsWith('.ts'));
    if (tsFiles.length > 0) {
      // Compile the TypeScript files
      if (!execute(`npm exec --silent -- tsc -p ${workingDirectory} --rootDir ${workingDirectory} --outDir ${tmpDir}`, workingDirectory)) {
        return;
      }
    }

    // Run the WebSocket server
    child = spawn(`node ${glideliteWsJs}${port}`, { shell: true, cwd: workingDirectory, stdio: 'inherit' });
  };

  // Internal function to stop and start running the WebSocket server
  const restartWsServer = () => {
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
      runWsServer();
    }, restartDelay);
  };

  // Internal function to handle watch events
  const handleWatchEvent = (event: string, path: string, type: string) => {
    // Ignore all directory events
    if (event.endsWith('Dir')) {
      return;
    }

    // Restart WebSocket server
    if (type !== 'shared') {
      // Special case: skip log because this log line is already logged for shared files in the moduleWorkers.ts file
      console.log(
        picocolors.dim(new Date().toLocaleTimeString()),
        picocolors.cyan(picocolors.bold('[glidelite]')),
        picocolors.gray(picocolors.dim(`(${type})`)),
        picocolors.green(`source ${event}`),
        picocolors.dim(path)
      );
    }
    restartWsServer();
  };

  // Internal function to handle watch errors
  const handleWatchError = (error: unknown, path: string) => {
    console.error(picocolors.red(`error GL${String(ExitStatus.DirectoryWatchFailed)}: Failed watching files at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`));
  };

  // Start running the WebSocket server
  runWsServer();

  // Watch for changes in files and restart WebSocket server when files changed
  const websocketWatcher = watch(websocketsDir);
  const sharedWatcher = watch(sharedDir);
  websocketWatcher.on('ready', () => {
    websocketWatcher.on('all', (event, path) => {
      handleWatchEvent(event, relative(websocketsDir, path), 'websocket');
    });
    websocketWatcher.on('error', error => {
      handleWatchError(error, websocketsDir);
    });
  });
  sharedWatcher.on('ready', () => {
    sharedWatcher.on('all', (event, path) => {
      handleWatchEvent(event, relative(sharedDir, path), 'shared');
    });
    sharedWatcher.on('error', error => {
      handleWatchError(error, sharedDir);
    });
  });
}

/**
 * Compiles the WebSocket input data in the specified working directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be compiled
 * @param outputDirectory the output directory where to put the compilation results in
 */
export function compile(pkg: Json, config: Json, workingDirectory: string, outputDirectory: string): void {
  // Write Crontab file
  const port = getWebSocketPort(config);
  const cronDir = join(outputDirectory, 'etc', 'cron.d');
  const cronFile = join(cronDir, `${config.name as string}_websockets`);
  makeDir(cronDir);
  makeFile(
    cronFile,
    `@reboot root node /opt/${config.name as string}/node_modules/glidelite/lib/wsserver/run.js${port} >> /var/log/${config.name as string}/websockets.log &\n` +
      `* * * * * root ps aux | grep -v grep | grep -c "node /opt/${config.name as string}/node_modules/glidelite/lib/wsserver/run.js${port}" || node /opt/${config.name as string}/node_modules/glidelite/lib/wsserver/run.js${port} >> /var/log/${config.name as string}/websockets.log &\n`
  );
}
