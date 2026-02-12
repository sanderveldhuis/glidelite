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
exports.clean = clean;
exports.validate = validate;
exports.run = run;
exports.compile = compile;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
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
    const apiTsConfig = (0, node_path_1.join)(workingDirectory, 'backend', 'api', 'tsconfig.json');
    const apiRouters = (0, node_path_1.join)(workingDirectory, 'backend', 'api', 'routers');
    const glideliteApiJs = (0, node_path_1.join)(workingDirectory, 'node_modules', 'glidelite', 'lib', 'api.js');
    if (!(0, sysUtils_1.exists)(apiTsConfig)) {
        console.error(`error GL${String(types_1.ExitStatus.ProjectInvalid)}:`, `No valid project found at: '${workingDirectory}', missing file '${apiTsConfig}'.`);
        return process.exit(types_1.ExitStatus.ProjectInvalid);
    }
    if (!(0, sysUtils_1.exists)(apiRouters)) {
        console.error(`error GL${String(types_1.ExitStatus.ProjectInvalid)}:`, `No valid project found at: '${workingDirectory}', missing directory '${apiRouters}'.`);
        return process.exit(types_1.ExitStatus.ProjectInvalid);
    }
    if (!(0, sysUtils_1.exists)(glideliteApiJs)) {
        console.error(`error GL${String(types_1.ExitStatus.ProjectInvalid)}:`, `No valid GlideLite dependency found at: '${workingDirectory}', missing file '${glideliteApiJs}'.`);
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
    const apiDir = (0, node_path_1.join)(workingDirectory, 'backend', 'api');
    const glideliteApiJs = (0, node_path_1.join)(workingDirectory, 'node_modules', 'glidelite', 'lib', 'api.js');
    const port = getApiPort(config);
    let child;
    let restartTimeout;
    // Internal function to start running the API server
    const runApiServer = () => {
        // Because dynamic imports are used the TypeScript files first have to be compiled
        // Cleanup to prevent running old files
        (0, sysUtils_1.remove)(tmpDir);
        // Get a list of all TypeScript files
        const allFiles = (0, sysUtils_1.readDir)(apiDir);
        const tsFiles = allFiles.filter(file => new RegExp('.ts$').test(file.name));
        if (tsFiles.length > 0) {
            // Compile the TypeScript files
            if (!(0, sysUtils_1.execute)(`npm exec -- tsc -p ${apiDir} --rootDir ${apiDir} --outDir ${tmpDir}`, workingDirectory)) {
                return;
            }
        }
        // Run the API server
        child = (0, node_child_process_1.spawn)(`node ${glideliteApiJs}${port}`, { shell: true, cwd: workingDirectory, stdio: 'inherit' });
    };
    // Start running the API server
    runApiServer();
    // Watch for changes in files and restart API server when files changed
    const watcher = (0, node_fs_1.watch)(apiDir, { recursive: true });
    watcher.on('change', () => {
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
    const apiDir = (0, node_path_1.join)(workingDirectory, 'backend', 'api');
    const outputDir = (0, node_path_1.join)(outputDirectory, 'opt', config.name, 'api');
    const port = getApiPort(config);
    // Get a list of all TypeScript files
    const allFiles = (0, sysUtils_1.readDir)(apiDir);
    const tsFiles = allFiles.filter(file => new RegExp('.ts$').test(file.name));
    if (tsFiles.length <= 0) {
        // Nothing to compile
        return;
    }
    // Compile the TypeScript files
    if ((0, sysUtils_1.execute)(`npm exec -- tsc -p ${apiDir} --rootDir ${apiDir} --outDir ${outputDir}`, workingDirectory)) {
        // Write Crontab file
        const cronDir = (0, node_path_1.join)(outputDirectory, 'etc', 'cron.d');
        const cronFile = (0, node_path_1.join)(cronDir, `${config.name}_api`);
        (0, sysUtils_1.makeDir)(cronDir);
        (0, sysUtils_1.makeFile)(cronFile, `@reboot root node /opt/${config.name}/node_modules/glidelite/lib/api.js${port} >> /var/log/${config.name}/api.log &\n` +
            `* * * * * root ps aux | grep -v grep | grep -c "node /opt/${config.name}/node_modules/glidelite/lib/api.js${port}" || node /opt/${config.name}/node_modules/glidelite/lib/api.js${port} >> /var/log/${config.name}/api.log &\n`);
    }
    else {
        process.exit(types_1.ExitStatus.ProjectCompileFailed);
    }
}
