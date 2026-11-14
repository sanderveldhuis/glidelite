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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = clean;
exports.validate = validate;
exports.run = run;
exports.compile = compile;
const chokidar_1 = require("chokidar");
const node_child_process_1 = require("node:child_process");
const node_path_1 = require("node:path");
const picocolors_1 = __importDefault(require("picocolors"));
const sysUtils_1 = require("./sysUtils");
const types_1 = require("./types");
const restartDelay = 1000;
/**
 * Searches for the API port in the GlideLite configuration.
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @returns the `string` representation of the API port
 */
function getApiPort(config) {
    if ('ports' in config && typeof config.ports === 'object' && config.ports !== null &&
        'api' in config.ports && typeof config.ports.api === 'number') {
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
function clean(pkg, config, outputDirectory) {
    (0, sysUtils_1.remove)((0, node_path_1.join)(outputDirectory, 'opt', config.name, 'api'));
    (0, sysUtils_1.remove)((0, node_path_1.join)(outputDirectory, 'etc', 'cron.d', `${config.name}_api`));
}
/**
 * Validates the API input data in the specified working directory to ensure everything is present for running the compilation.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be validated
 */
function validate(pkg, config, workingDirectory) {
    const apiRouters = (0, node_path_1.join)(workingDirectory, 'backend', 'api', 'routers');
    const glideliteApiJs = (0, node_path_1.join)(workingDirectory, 'node_modules', 'glidelite', 'lib', 'apiserver', 'run.js');
    if (!(0, sysUtils_1.exists)(apiRouters)) {
        console.error(picocolors_1.default.red(`error GL${String(types_1.ExitStatus.ProjectInvalid)}: No valid project found at: '${workingDirectory}', missing directory '${apiRouters}'.`));
        return process.exit(types_1.ExitStatus.ProjectInvalid);
    }
    if (!(0, sysUtils_1.exists)(glideliteApiJs)) {
        console.error(picocolors_1.default.red(`error GL${String(types_1.ExitStatus.ProjectInvalid)}: No valid GlideLite dependency found at: '${workingDirectory}', missing file '${glideliteApiJs}'.`));
        return process.exit(types_1.ExitStatus.ProjectInvalid);
    }
}
/**
 * Runs the API input data at the specified working directory for development.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be run
 */
function run(pkg, config, workingDirectory) {
    const tmpDir = (0, node_path_1.join)(workingDirectory, 'node_modules', '.tmp', 'glc');
    const backendDir = (0, node_path_1.join)(workingDirectory, 'backend');
    const apiDir = (0, node_path_1.join)(backendDir, 'api');
    const sharedDir = (0, node_path_1.join)(workingDirectory, 'shared');
    const glideliteApiJs = (0, node_path_1.join)(workingDirectory, 'node_modules', 'glidelite', 'lib', 'apiserver', 'run.js');
    const port = getApiPort(config);
    let child;
    let restartTimeout;
    // Internal function to start running the API server
    const runApiServer = () => {
        // Because dynamic imports are used the TypeScript files first have to be compiled, JavaScript files can be used as-is
        // Cleanup to prevent running old files
        (0, sysUtils_1.remove)(tmpDir);
        // Read all files in the API directory
        const allFiles = (0, sysUtils_1.readDir)(apiDir);
        // Copy JavaScript files to the temporary directory
        const jsFiles = allFiles.filter(file => new RegExp('.js$').test(file.name));
        for (const file of jsFiles) {
            const filePath = (0, node_path_1.join)(file.parentPath, file.name);
            const destPath = (0, node_path_1.join)(tmpDir, (0, node_path_1.relative)(workingDirectory, filePath));
            (0, sysUtils_1.makeDir)((0, node_path_1.dirname)(destPath));
            (0, sysUtils_1.copyFile)(filePath, destPath);
        }
        // Compile TypeScript files to the temporary directory
        const tsFiles = allFiles.filter(file => new RegExp('.ts$').test(file.name));
        if (tsFiles.length > 0) {
            // Compile the TypeScript files
            if (!(0, sysUtils_1.execute)(`npm exec --silent -- tsc -p ${workingDirectory} --rootDir ${workingDirectory} --outDir ${tmpDir}`, workingDirectory)) {
                return;
            }
        }
        // Run the API server
        child = (0, node_child_process_1.spawn)(`node ${glideliteApiJs}${port}`, { shell: true, cwd: workingDirectory, stdio: 'inherit' });
    };
    // Internal function to stop and start running the API server
    const restartApiServer = () => {
        // Use a delay to prevent restarting too much
        clearTimeout(restartTimeout);
        restartTimeout = setTimeout(() => {
            if (child !== undefined) {
                if ('win32' === process.platform) {
                    (0, node_child_process_1.spawn)('taskkill', ['/pid', String(child.pid), '/f', '/t']);
                }
                else {
                    (0, node_child_process_1.spawn)('sh', ['-c', `kill -9 ${String(child.pid)}`]);
                }
            }
            runApiServer();
        }, restartDelay);
    };
    // Internal function to handle watch events
    const handleWatchEvent = (event, path, type) => {
        // Ignore all directory events
        if (event.endsWith('Dir')) {
            return;
        }
        // Restart API server
        if (type !== 'shared') {
            // Special case: skip log because this log line is already logged for shared files in the moduleWorkers.ts file
            console.log(picocolors_1.default.dim(new Date().toLocaleTimeString()), picocolors_1.default.cyan(picocolors_1.default.bold('[glidelite]')), picocolors_1.default.gray(picocolors_1.default.dim(`(${type})`)), picocolors_1.default.green(`source ${event}`), picocolors_1.default.dim(path));
        }
        restartApiServer();
    };
    // Internal function to handle watch errors
    const handleWatchError = (error, path) => {
        console.error(picocolors_1.default.red(`error GL${String(types_1.ExitStatus.DirectoryWatchFailed)}: Failed watching files at: '${path}'${error instanceof Error ? `, ${error.message}` : ''}.`));
    };
    // Start running the API server
    runApiServer();
    // Watch for changes in files and restart API server when files changed
    const apiWatcher = (0, chokidar_1.watch)(apiDir);
    const sharedWatcher = (0, chokidar_1.watch)(sharedDir);
    apiWatcher.on('ready', () => {
        apiWatcher.on('all', (event, path) => {
            handleWatchEvent(event, (0, node_path_1.relative)(apiDir, path), 'api');
        });
        apiWatcher.on('error', error => {
            handleWatchError(error, apiDir);
        });
    });
    sharedWatcher.on('ready', () => {
        sharedWatcher.on('all', (event, path) => {
            handleWatchEvent(event, (0, node_path_1.relative)(sharedDir, path), 'shared');
        });
        sharedWatcher.on('error', error => {
            handleWatchError(error, sharedDir);
        });
    });
}
/**
 * Compiles the API input data in the specified working directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be compiled
 * @param outputDirectory the output directory where to put the compilation results in
 */
function compile(pkg, config, workingDirectory, outputDirectory) {
    // Write Crontab file
    const port = getApiPort(config);
    const cronDir = (0, node_path_1.join)(outputDirectory, 'etc', 'cron.d');
    const cronFile = (0, node_path_1.join)(cronDir, `${config.name}_api`);
    (0, sysUtils_1.makeDir)(cronDir);
    (0, sysUtils_1.makeFile)(cronFile, `@reboot root node /opt/${config.name}/node_modules/glidelite/lib/apiserver/run.js${port} >> /var/log/${config.name}/api.log &\n` +
        `* * * * * root ps aux | grep -v grep | grep -c "node /opt/${config.name}/node_modules/glidelite/lib/apiserver/run.js${port}" || node /opt/${config.name}/node_modules/glidelite/lib/apiserver/run.js${port} >> /var/log/${config.name}/api.log &\n`);
}
