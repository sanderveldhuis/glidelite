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
import * as compileFrontend from './compileFrontend';
import * as compileWorkers from './compileWorkers';
import {
  makeDir,
  makeFile,
  remove
} from './sysUtils';
import { Json } from './types';
import { version } from './version';

/**
 * Cleans the project output data from the specified output directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param outputDirectory the output directory to be cleaned
 */
export function clean(pkg: Json, config: Json, outputDirectory: string): void {
  // Never remove the complete output directory but only remove the actual generated output data to prevent erasing
  // user data if the user specified an invalid output directory (e.g. the user home folder)

  // Clean each module
  compileWorkers.clean(pkg, config, outputDirectory);
  compileFrontend.clean(pkg, config, outputDirectory);

  // Clean the project
  remove(join(outputDirectory, 'install'));
  remove(join(outputDirectory, 'opt', config.name as string));
  remove(join(outputDirectory, 'etc', 'logrotate.d'));
}

/**
 * Validates the project input data in the specified working directory to ensure everything is present for running the compilation.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be validated
 */
export function validate(pkg: Json, config: Json, workingDirectory: string): void {
  compileWorkers.validate(pkg, config, workingDirectory);
  compileFrontend.validate(pkg, config, workingDirectory);
}

/**
 * Compiles the project input data in the specified working directory.
 * @param pkg the package configuration loaded from the package.json file
 * @param config the GlideLite configuration loaded from the glconfig.json file
 * @param workingDirectory the working directory to be compiled
 * @param outputDirectory the output directory where to put the compilation results in
 */
export function compile(pkg: Json, config: Json, workingDirectory: string, outputDirectory: string): void {
  // Compile each module
  compileWorkers.compile(pkg, config, workingDirectory, outputDirectory);
  compileFrontend.compile(pkg, config, workingDirectory, outputDirectory);

  // Create project configuration files
  const optDir = join(outputDirectory, 'opt', config.name as string);
  const packageFile = join(optDir, 'package.json');
  const glconfigFile = join(optDir, 'glconfig.json');
  makeDir(optDir);
  makeFile(packageFile, JSON.stringify({ name: config.name, version: config.version, dependencies: Object.assign({}, pkg.dependencies, { glidelite: `github:sanderveldhuis/glidelite#v${version}` }) }));
  makeFile(glconfigFile, JSON.stringify(config));

  // Create logrotate configuration file
  const logrotateDir = join(outputDirectory, 'etc', 'logrotate.d');
  const logrotateCnf = join(logrotateDir, config.name as string);
  makeDir(logrotateDir);
  makeFile(
    logrotateCnf,
    `/var/log/${config.name as string}/*.log {\n` +
      '    weekly\n' +
      '    rotate 12\n' +
      '    maxsize 500M\n' +
      '    compress\n' +
      '    delaycompress\n' +
      '    missingok\n' +
      '    notifempty\n' +
      '    copytruncate\n' +
      '}\n'
  );

  // Construct a list of required Linux APT packages and filter out duplicates
  const packages = ['cron', 'logrotate', 'nodejs', 'nginx', 'certbot', 'python3-certbot-nginx'].concat((config.packages ?? []) as string[]);
  const filteredPackages = packages.filter((item, pos) => {
    return packages.indexOf(item) == pos;
  });

  // Create install script
  makeFile(
    join(outputDirectory, 'install'),
    '#!/bin/bash\n\n' +
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
      `rm -rf /var/www/${config.name as string}\n` +
      `rm -rf /etc/cron.d/${config.name as string}_workers\n` +
      `rm -rf /opt/${config.name as string}\n` +
      `pkill -f "node /opt/${config.name as string}/workers"\n\n` +
      '# Copy new project\n' +
      `mkdir -p /var/log/${config.name as string}\n` +
      'cp -r var /\n' +
      'cp -r opt /\n' +
      'cp -r etc /\n\n' +
      '# Install dependencies\n' +
      `pushd /opt/${config.name as string}\n` +
      'npm install\n' +
      'popd\n\n' +
      '# Finish message\n' +
      'SECONDS=$(($(date +%s -d "$(date +%H:%M) + next minute") - $(date +%s) + 10))\n' +
      'echo "Installation finished!"\n' +
      'echo "Your project should be up and running after ${SECONDS} seconds from now"\n'
  );
}
