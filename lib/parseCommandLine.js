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
exports.parseCommandLine = parseCommandLine;
const types_1 = require("./types");
const shortOptionNameMap = new Map([
    ['h', 'help'],
    ['v', 'version'],
    ['i', 'init'],
    ['c', 'clean'],
    ['m', 'module'],
    ['o', 'outdir']
]);
const optionNameMap = new Map([
    ['help', { name: 'help', type: 'boolean' }],
    ['version', { name: 'version', type: 'boolean' }],
    ['init', { name: 'init', type: 'boolean' }],
    ['clean', { name: 'clean', type: 'boolean' }],
    ['module', { name: 'module', type: 'string', values: ['workers', 'api', 'backend', 'js', 'css', 'site', 'frontend'] }],
    ['outdir', { name: 'outdir', type: 'string' }]
]);
function getOptionDeclarationFromName(optionName) {
    optionName = optionName.toLowerCase();
    // Try to translate short option names to their full equivalents
    const short = shortOptionNameMap.get(optionName);
    if (short) {
        optionName = short;
    }
    return optionNameMap.get(optionName);
}
function parseOptionValue(commandLineArgs, i, option, options) {
    // Only booleans do not require a value
    if (!commandLineArgs[i] && 'boolean' !== option.type) {
        console.error(`error GL${String(types_1.ExitStatus.CommandLineArgumentMissing)}:`, `Compiler option '${option.name}' expects an argument.`);
        process.exit(types_1.ExitStatus.CommandLineArgumentMissing);
    }
    else {
        const value = commandLineArgs[i];
        switch (option.type) {
            case 'boolean': {
                if (value === 'false' || value === 'true') {
                    options[option.name] = value === 'true';
                    i++;
                }
                else {
                    options[option.name] = true;
                }
                break;
            }
            default: {
                if (option.values && !option.values.includes(value)) {
                    console.error(`error GL${String(types_1.ExitStatus.CommandLineArgumentInvalid)}:`, `Argument for '${option.name}' option must be: '${option.values.join("', '")}'.`);
                    process.exit(types_1.ExitStatus.CommandLineArgumentInvalid);
                }
                else {
                    options[option.name] = value;
                }
                i++;
                break;
            }
        }
    }
    return i;
}
function parseCommandLine(commandLineArgs) {
    const options = {};
    const paths = [];
    let i = 0;
    while (i < commandLineArgs.length) {
        const arg = commandLineArgs[i];
        i++;
        if (arg.startsWith('-')) {
            const optionName = arg.slice(arg.charAt(1) === '-' ? 2 : 1);
            const option = getOptionDeclarationFromName(optionName);
            if (option) {
                i = parseOptionValue(commandLineArgs, i, option, options);
            }
            else {
                console.error(`error GL${String(types_1.ExitStatus.CommandLineOptionUnknown)}:`, `Unknown compiler option '${arg}'.`);
                process.exit(types_1.ExitStatus.CommandLineOptionUnknown);
            }
        }
        else {
            paths.push(arg);
        }
    }
    return { options, paths };
}
