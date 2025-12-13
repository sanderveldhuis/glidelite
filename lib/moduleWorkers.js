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
const color_1 = require("./color");
const sysUtils_1 = require("./sysUtils");
const types_1 = require("./types");
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
const restartDelay = 1000;
/**
 * Searches for all TypeScript files with a valid compiler instruction.
 * @details this function will search directories recursively
 * @param workersDir the directory containing the TypeScript files
 * @returns the list of worker files, or `undefined` on error
 */
function getWorkerFiles(workersDir) {
    const workerFiles = {};
    // Get a list of all TypeScript files
    const allFiles = (0, sysUtils_1.readDir)(workersDir);
    const tsFiles = allFiles.filter(file => new RegExp('.ts$').test(file.name));
    // Check for compiler instruction in each TypeScript file
    for (const file of tsFiles) {
        // Read the TypeScript file content
        const filePath = (0, node_path_1.join)(file.parentPath, file.name);
        const content = (0, sysUtils_1.readFile)(filePath);
        // Check whether compiler instruction is available
        const gotInstruction = new RegExp(/["']glc .*["']/).exec(content);
        if (gotInstruction === null) {
            continue;
        }
        // Check whether compiler instruction is valid
        const instruction = new RegExp(regex).exec(content);
        if (instruction === null) {
            console.error(`error GL${String(types_1.ExitStatus.ProjectCompileFailed)}:`, `Invalid compiler instruction found in: '${filePath}'.`);
            return process.exit(types_1.ExitStatus.ProjectCompileFailed);
        }
        // Append the executable worker
        workerFiles[filePath] = instruction;
    }
    return workerFiles;
}
/**
 * Cleans the workers output data from the specified output directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param outputDirectory the output directory to be cleaned
 */
function clean(pkg, config, outputDirectory) {
    (0, sysUtils_1.remove)((0, node_path_1.join)(outputDirectory, 'opt', config.name, 'workers'));
    (0, sysUtils_1.remove)((0, node_path_1.join)(outputDirectory, 'etc', 'cron.d', `${config.name}_workers`));
}
/**
 * Validates the workers input data in the specified working directory to ensure everything is present for running the compilation.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be validated
 */
function validate(pkg, config, workingDirectory) {
    const workersTsConfig = (0, node_path_1.join)(workingDirectory, 'backend', 'workers', 'tsconfig.json');
    if (!(0, sysUtils_1.exists)(workersTsConfig)) {
        console.error(`error GL${String(types_1.ExitStatus.ProjectInvalid)}:`, `No valid project found at: '${workingDirectory}', missing file '${workersTsConfig}'.`);
        return process.exit(types_1.ExitStatus.ProjectInvalid);
    }
}
/**
 * Runs the workers input data at the specified working directory for development.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be run
 */
function run(pkg, config, workingDirectory) {
    const skippedWorkers = [];
    const children = [];
    const workersDir = (0, node_path_1.join)(workingDirectory, 'backend', 'workers');
    let restartTimeout;
    // Internal function to start running all workers
    const runWorkers = () => {
        const workerFiles = getWorkerFiles(workersDir);
        if (workerFiles === undefined) {
            return;
        }
        // Run workers based on compiler instructions in the TypeScript files
        for (const [filePath, instruction] of Object.entries(workerFiles)) {
            // Only run service workers
            if (instruction[1] !== 'service') {
                if (!skippedWorkers.includes(filePath)) {
                    console.log((0, color_1.yellow)(`Skipped worker: '${filePath}', only service workers are executed.`));
                    console.log((0, color_1.yellow)(`Use the following command to run the worker manually: 'npx ts-node ${filePath}'.`));
                }
                skippedWorkers.push(filePath);
                continue;
            }
            // Run the worker and restart if the file has changed
            const child = (0, node_child_process_1.spawn)(`npm exec -- ts-node ${filePath}`, { shell: true, cwd: workingDirectory, stdio: 'inherit' });
            children.push(child);
        }
    };
    // Start running all workers
    runWorkers();
    // Watch for changes in files and restart workers when files changed
    const watcher = (0, node_fs_1.watch)(workersDir, { recursive: true });
    watcher.on('change', () => {
        // Use a delay to prevent restarting too much
        clearTimeout(restartTimeout);
        restartTimeout = setTimeout(() => {
            let child;
            while ((child = children.pop()) !== undefined) {
                if ('win32' === process.platform) {
                    (0, node_child_process_1.spawn)('taskkill', ['/pid', String(child.pid), '/f', '/t']);
                }
                else {
                    (0, node_child_process_1.spawn)('sh', ['-c', `kill -9 ${String(child.pid)}`]);
                }
            }
            runWorkers();
        }, restartDelay);
    });
}
/**
 * Compiles the workers input data in the specified working directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be compiled
 * @param outputDirectory the output directory where to put the compilation results in
 */
function compile(pkg, config, workingDirectory, outputDirectory) {
    const workersDir = (0, node_path_1.join)(workingDirectory, 'backend', 'workers');
    const outputDir = (0, node_path_1.join)(outputDirectory, 'opt', config.name, 'workers');
    // Get a list of all worker files
    const workerFiles = getWorkerFiles(workersDir);
    if (workerFiles === undefined || Object.keys(workerFiles).length <= 0) {
        // Nothing to compile
        return;
    }
    // Compile the TypeScript files
    (0, sysUtils_1.execute)(`npm exec -- tsc -p ${workersDir} --rootDir ${workersDir} --outDir ${outputDir}`, workingDirectory);
    // Construct Crontab content based on compiler instructions in the TypeScript files
    let crontab = '';
    for (const [filePath, instruction] of Object.entries(workerFiles)) {
        // Construct Crontab content for either a task or a service
        const jsFilePath = filePath.replace(workersDir, '').replace(/\\/g, '/').replace(/^\//, '').replace(/.ts$/, '.js');
        if (instruction[1] === 'service') {
            crontab += `@reboot root node /opt/${config.name}/workers/${jsFilePath} >> /var/log/${config.name}/workers.log &\n`;
            crontab += `* * * * * root ps aux | grep -v grep | grep -c "node /opt/${config.name}/workers/${jsFilePath}" || node /opt/${config.name}/workers/${jsFilePath} >> /var/log/${config.name}/workers.log &\n`;
        }
        else {
            crontab += `${instruction[2]} root node /opt/${config.name}/workers/${jsFilePath} >> /var/log/${config.name}/workers.log &\n`;
        }
    }
    // Write Crontab file
    const cronDir = (0, node_path_1.join)(outputDirectory, 'etc', 'cron.d');
    const cronFile = (0, node_path_1.join)(cronDir, `${config.name}_workers`);
    (0, sysUtils_1.makeDir)(cronDir);
    (0, sysUtils_1.makeFile)(cronFile, crontab);
}
