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
exports.compile = compile;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
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
const regex = `["']glc (task|service) (` +
    '(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(' + // Allow @annually, @yearly, @monthly, @weekly, @daily, @hourly, @reboot OR the following following:
    '(' + regexMinuteList + '(,' + regexMinuteList + ')*|' + any + ') ' + // Single/list minutes, comma separated minutes, or any value (*)
    '(' + regexHourList + '(,' + regexHourList + ')*|' + any + ') ' + // Single/list hour, comma separated hours, or any value (*)
    '(' + dayOfMonthList + '(,' + dayOfMonthList + ')*|' + any + ') ' + // Single/list day of month, comma separated days of month, or any value (*)
    '(' + monthList + '(,' + monthList + ')*|' + any + ') ' + // Single/list month, comma separated months, or any value (*)
    '(' + dayOfWeekList + '(,' + dayOfWeekList + ')*|' + any + ')' + // Single/list day of week, comma separated days of week, or any value (*)
    `))["']`;
function clean(pkg, config, outputDirectory) {
    (0, sysUtils_1.remove)((0, node_path_1.join)(outputDirectory, 'opt', config.name, 'workers'));
    (0, sysUtils_1.remove)((0, node_path_1.join)(outputDirectory, 'etc', 'cron.d', `${config.name}_workers`));
}
function validate(pkg, config, workingDirectory) {
    const workersTsConfig = (0, node_path_1.join)(workingDirectory, 'backend', 'workers', 'tsconfig.json');
    if (!(0, node_fs_1.existsSync)(workersTsConfig)) {
        console.error(`error GL${String(types_1.ExitStatus.ProjectInvalid)}:`, `No valid project found at: '${workingDirectory}', missing file '${workersTsConfig}'.`);
        return process.exit(types_1.ExitStatus.ProjectInvalid);
    }
}
function compile(pkg, config, workingDirectory, outputDirectory) {
    const workersDir = (0, node_path_1.join)(workingDirectory, 'backend', 'workers');
    const allFiles = (0, node_fs_1.readdirSync)(workersDir, { withFileTypes: true, recursive: true });
    const tsFiles = allFiles.filter(file => new RegExp('.ts$').test(file.name));
    if (tsFiles.length <= 0) {
        // Nothing to compile
        return;
    }
    const outputDir = (0, node_path_1.join)(outputDirectory, 'opt', config.name, 'workers');
    (0, sysUtils_1.execute)(`tsc -p ${workersDir} --outDir ${outputDir}`, workingDirectory);
    let crontab = '';
    for (const file of tsFiles) {
        const filePath = (0, node_path_1.join)(file.parentPath, file.name);
        const content = (0, sysUtils_1.readFile)(filePath);
        const gotInstruction = new RegExp(/["']glc .*["']/).exec(content);
        if (null !== gotInstruction) {
            const instruction = new RegExp(regex).exec(content);
            if (null !== instruction) {
                // TODO: validate crontab rules whether they work with the new directories, also validate what happens when the ${file.parentPath} is the directory itself
                crontab += `${instruction[2]} root cd /opt/${config.name}/workers && node ${file.parentPath}/${file.name.replace(/.ts$/, '.js')} &\n`;
                if (instruction[1] === 'service') {
                    crontab += `* * * * * root ps aux | grep -v grep | grep -c "node ${file.parentPath}/${file.name.replace(/.ts$/, '.js')}" || cd /opt/${config.name}/workers && node ${file.parentPath}/${file.name.replace(/.ts$/, '.js')} &\n`;
                }
            }
            else {
                console.error(`error GL${String(types_1.ExitStatus.ProjectCompileFailed)}:`, `Invalid compiler instruction found in: '${filePath}'.`);
                return process.exit(types_1.ExitStatus.ProjectCompileFailed);
            }
        }
    }
    const packageFile = (0, node_path_1.join)(outputDir, 'package.json');
    const glconfigFile = (0, node_path_1.join)(outputDir, 'glconfig.json');
    (0, sysUtils_1.makeFile)(packageFile, JSON.stringify({ name: config.name, version: config.version, dependencies: pkg.dependencies }));
    (0, sysUtils_1.makeFile)(glconfigFile, JSON.stringify(config));
    if (crontab !== '') {
        const cronDir = (0, node_path_1.join)(outputDirectory, 'etc', 'cron.d');
        const cronFile = (0, node_path_1.join)(cronDir, `${config.name}_workers`);
        (0, sysUtils_1.makeDir)(cronDir);
        (0, sysUtils_1.makeFile)(cronFile, crontab);
    }
}
