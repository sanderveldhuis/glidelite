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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = clean;
exports.validate = validate;
exports.run = run;
exports.compile = compile;
const node_path_1 = require("node:path");
const moduleBackend = __importStar(require("./moduleBackend"));
const moduleFrontend = __importStar(require("./moduleFrontend"));
const sysUtils_1 = require("./sysUtils");
const types_1 = require("./types");
const version_1 = require("./version");
const regexUrl = '^https?://[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}/?$';
/**
 * Cleans the project output data from the specified output directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param outputDirectory the output directory to be cleaned
 */
function clean(pkg, config, outputDirectory) {
    // Never remove the complete output directory but only remove the actual generated output data to prevent erasing
    // user data if the user specified an invalid output directory (e.g. the user home folder)
    // Clean each module
    moduleBackend.clean(pkg, config, outputDirectory);
    moduleFrontend.clean(pkg, config, outputDirectory);
    // Clean the project
    (0, sysUtils_1.remove)((0, node_path_1.join)(outputDirectory, 'install'));
    (0, sysUtils_1.remove)((0, node_path_1.join)(outputDirectory, 'opt', config.name));
    (0, sysUtils_1.remove)((0, node_path_1.join)(outputDirectory, 'etc', 'logrotate.d'));
}
/**
 * Validates the project input data in the specified working directory to ensure everything is present for running the compilation.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be validated
 */
function validate(pkg, config, workingDirectory) {
    moduleBackend.validate(pkg, config, workingDirectory);
    moduleFrontend.validate(pkg, config, workingDirectory);
    // Validate homepage
    if (typeof config.homepage !== 'undefined' && (typeof config.homepage !== 'string' || !new RegExp(regexUrl).test(config.homepage))) {
        console.error(`error GL${String(types_1.ExitStatus.ProjectInvalid)}:`, `No valid project found at: '${workingDirectory}', invalid homepage '${typeof config.homepage === 'string' ? config.homepage : JSON.stringify(config.homepage)}'.`);
        return process.exit(types_1.ExitStatus.ProjectInvalid);
    }
}
/**
 * Runs the project input data at the specified working directory for development.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be run
 */
function run(pkg, config, workingDirectory) {
    moduleBackend.run(pkg, config, workingDirectory);
    moduleFrontend.run(pkg, config, workingDirectory);
}
/**
 * Compiles the project input data in the specified working directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be compiled
 * @param outputDirectory the output directory where to put the compilation results in
 */
function compile(pkg, config, workingDirectory, outputDirectory) {
    // Compile each module
    moduleBackend.compile(pkg, config, workingDirectory, outputDirectory);
    moduleFrontend.compile(pkg, config, workingDirectory, outputDirectory);
    // Create project configuration files
    const optDir = (0, node_path_1.join)(outputDirectory, 'opt', config.name);
    const packageFile = (0, node_path_1.join)(optDir, 'package.json');
    const glconfigFile = (0, node_path_1.join)(optDir, 'glconfig.json');
    (0, sysUtils_1.makeDir)(optDir);
    (0, sysUtils_1.makeFile)(packageFile, JSON.stringify({ name: config.name, version: config.version, dependencies: Object.assign({}, pkg.dependencies, { glidelite: `github:sanderveldhuis/glidelite#v${version_1.version}` }) }));
    (0, sysUtils_1.makeFile)(glconfigFile, JSON.stringify(config));
    // Create logrotate configuration file
    const logrotateDir = (0, node_path_1.join)(outputDirectory, 'etc', 'logrotate.d');
    const logrotateCnf = (0, node_path_1.join)(logrotateDir, config.name);
    (0, sysUtils_1.makeDir)(logrotateDir);
    (0, sysUtils_1.makeFile)(logrotateCnf, `/var/log/${config.name}/*.log {\n` +
        '    weekly\n' +
        '    rotate 12\n' +
        '    maxsize 500M\n' +
        '    compress\n' +
        '    delaycompress\n' +
        '    missingok\n' +
        '    notifempty\n' +
        '    copytruncate\n' +
        '}\n');
    // Construct a list of required Linux APT packages and filter out duplicates
    const packages = ['cron', 'logrotate', 'nodejs', 'nginx', 'certbot', 'python3-certbot-nginx'].concat((config.packages ?? []));
    const filteredPackages = packages.filter((item, pos) => {
        return packages.indexOf(item) == pos;
    });
    // Create install script
    (0, sysUtils_1.makeFile)((0, node_path_1.join)(outputDirectory, 'install'), '#!/bin/bash\n\n' +
        '# Check permissions\n' +
        'if [ $EUID -ne 0 ]; then\n' +
        '  echo "This install script should be run as root"\n' +
        '  exit 1\n' +
        'fi\n\n' +
        '# Install required packages\n' +
        `dpkg -s ${filteredPackages.join(' ')} > /dev/null 2>&1\n` +
        'if [ $? -ne 0 ]; then\n' +
        '  apt-get update\n' +
        `  apt-get install ${filteredPackages.join(' ')}\n` +
        '  if [ $? -ne 0 ]; then\n' +
        '    echo "Not all required packages are installed"\n' +
        '    exit 1\n' +
        '  fi\n' +
        'fi\n\n' +
        '# Cleanup old project\n' +
        `rm -rf /var/www/${config.name}\n` +
        `rm -rf /etc/cron.d/${config.name}_workers\n` +
        `rm -rf /opt/${config.name}\n` +
        `pkill -f "node /opt/${config.name}/workers"\n\n` +
        '# Copy new project\n' +
        `mkdir -p /var/log/${config.name}\n` +
        'cp -r var /\n' +
        'cp -r opt /\n' +
        'cp -r etc /\n\n' +
        '# Install dependencies\n' +
        `pushd /opt/${config.name}\n` +
        'npm install\n' +
        'popd\n\n' +
        (config.homepage && config.homepage.startsWith('https://') ?
            '# Obtain the SSL/TLS certificate\n' +
                `certbot --nginx -d ${config.homepage.replace('https://', '').replace(/\/$/, '')}${config.homepage.split('.').length > 2 ? '' : ` -d www.${config.homepage.replace('https://', '').replace(/\/$/, '')}`}\n\n` : '') +
        '# Finish message\n' +
        'SECONDS=$(($(date +%s -d "$(date +%H:%M) + next minute") - $(date +%s) + 10))\n' +
        'echo "Installation finished!"\n' +
        'echo "Your project should be up and running after ${SECONDS} seconds from now"\n');
}
