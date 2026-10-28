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

import path from 'node:path';
import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';
import * as moduleBackendSrc from '../../src/compiler/moduleBackend';
import * as moduleFrontendSrc from '../../src/compiler/moduleFrontend';
import {
  clean,
  compile,
  run,
  validate
} from '../../src/compiler/moduleProject';
import * as sysUtilsSrc from '../../src/compiler/sysUtils';

describe('moduleProject.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validate checking the project', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const validateBackend = vi.spyOn(moduleBackendSrc, 'validate').mockImplementation(() => {/*Emtpy*/});
    const validateFrontend = vi.spyOn(moduleFrontendSrc, 'validate').mockImplementation(() => {/*Emtpy*/});
    const exists = vi.spyOn(sysUtilsSrc, 'exists');

    // All required files and directories exist, no homepage available
    exists.mockReturnValueOnce(true);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input1');
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenLastCalledWith(path.normalize('input1/tsconfig.json'));
    expect(validateBackend).toHaveBeenCalledTimes(1);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'input1');
    expect(validateFrontend).toHaveBeenCalledTimes(1);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'input1');

    // Not all required files and directories exist
    exists.mockReturnValueOnce(false);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input2');
    expect(exists).toHaveBeenCalledTimes(2);
    expect(exists).toHaveBeenLastCalledWith(path.normalize('input2/tsconfig.json'));
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('error GL3001:', path.normalize("No valid project found at: 'input2', missing file 'input2/tsconfig.json'."));
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(3001);

    // All required files and directories exist, valid homepage
    exists.mockReturnValueOnce(true);
    validate({ name: 'pkg' }, { name: 'cfg', homepage: 'http://example.com' }, 'input');
    expect(validateBackend).toHaveBeenCalledTimes(2);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: 'http://example.com' }, 'input');
    expect(validateFrontend).toHaveBeenCalledTimes(2);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: 'http://example.com' }, 'input');
    exists.mockReturnValueOnce(true);
    validate({ name: 'pkg' }, { name: 'cfg', homepage: 'https://example.com' }, 'input');
    expect(validateBackend).toHaveBeenCalledTimes(3);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: 'https://example.com' }, 'input');
    expect(validateFrontend).toHaveBeenCalledTimes(3);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: 'https://example.com' }, 'input');

    // All required files and directories exist, invalid homepage type
    exists.mockReturnValueOnce(true);
    validate({ name: 'pkg' }, { name: 'cfg', homepage: 1 }, 'input');
    expect(validateBackend).toHaveBeenCalledTimes(4);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: 1 }, 'input');
    expect(validateFrontend).toHaveBeenCalledTimes(4);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: 1 }, 'input');
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith('error GL3001:', "No valid project found at: 'input', invalid homepage '1'.");
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(3001);
    exists.mockReturnValueOnce(true);
    validate({ name: 'pkg' }, { name: 'cfg', homepage: true }, 'input');
    expect(validateBackend).toHaveBeenCalledTimes(5);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: true }, 'input');
    expect(validateFrontend).toHaveBeenCalledTimes(5);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: true }, 'input');
    expect(consoleError).toHaveBeenCalledTimes(3);
    expect(consoleError).toHaveBeenLastCalledWith('error GL3001:', "No valid project found at: 'input', invalid homepage 'true'.");
    expect(processExit).toHaveBeenCalledTimes(3);
    expect(processExit).toHaveBeenLastCalledWith(3001);
    exists.mockReturnValueOnce(true);
    validate({ name: 'pkg' }, { name: 'cfg', homepage: null }, 'input');
    expect(validateBackend).toHaveBeenCalledTimes(6);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: null }, 'input');
    expect(validateFrontend).toHaveBeenCalledTimes(6);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: null }, 'input');
    expect(consoleError).toHaveBeenCalledTimes(4);
    expect(consoleError).toHaveBeenLastCalledWith('error GL3001:', "No valid project found at: 'input', invalid homepage 'null'.");
    expect(processExit).toHaveBeenCalledTimes(4);
    expect(processExit).toHaveBeenLastCalledWith(3001);
    exists.mockReturnValueOnce(true);
    validate({ name: 'pkg' }, { name: 'cfg', homepage: { url: 'https://example.com/' } }, 'input');
    expect(validateBackend).toHaveBeenCalledTimes(7);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: { url: 'https://example.com/' } }, 'input');
    expect(validateFrontend).toHaveBeenCalledTimes(7);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: { url: 'https://example.com/' } }, 'input');
    expect(consoleError).toHaveBeenCalledTimes(5);
    expect(consoleError).toHaveBeenLastCalledWith('error GL3001:', 'No valid project found at: \'input\', invalid homepage \'{"url":"https://example.com/"}\'.');
    expect(processExit).toHaveBeenCalledTimes(5);
    expect(processExit).toHaveBeenLastCalledWith(3001);

    // All required files and directories exist, invalid homepage format
    exists.mockReturnValueOnce(true);
    validate({ name: 'pkg' }, { name: 'cfg', homepage: 'example.com' }, 'input');
    expect(validateBackend).toHaveBeenCalledTimes(8);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: 'example.com' }, 'input');
    expect(validateFrontend).toHaveBeenCalledTimes(8);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', homepage: 'example.com' }, 'input');
    expect(consoleError).toHaveBeenCalledTimes(6);
    expect(consoleError).toHaveBeenLastCalledWith('error GL3001:', "No valid project found at: 'input', invalid homepage 'example.com'.");
    expect(processExit).toHaveBeenCalledTimes(6);
    expect(processExit).toHaveBeenLastCalledWith(3001);
  });

  it('validate cleaning the project', () => {
    const cleanBackend = vi.spyOn(moduleBackendSrc, 'clean').mockImplementation(() => {/*Emtpy*/});
    const cleanFrontend = vi.spyOn(moduleFrontendSrc, 'clean').mockImplementation(() => {/*Emtpy*/});
    const remove = vi.spyOn(sysUtilsSrc, 'remove').mockImplementation(() => {/*Emtpy*/});

    clean({ name: 'pkg' }, { name: 'cfg' }, 'output');
    expect(cleanBackend).toHaveBeenCalledTimes(1);
    expect(cleanBackend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'output');
    expect(cleanFrontend).toHaveBeenCalledTimes(1);
    expect(cleanFrontend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'output');
    expect(remove).toHaveBeenCalledTimes(4);
    expect(remove).toHaveBeenNthCalledWith(1, path.normalize('output/install'));
    expect(remove).toHaveBeenNthCalledWith(2, path.normalize('output/opt/cfg'));
    expect(remove).toHaveBeenNthCalledWith(3, path.normalize('output/etc/logrotate.d'));
    expect(remove).toHaveBeenNthCalledWith(4, path.normalize('output/etc/nginx'));
  });

  it('validate running the project', () => {
    const runBackend = vi.spyOn(moduleBackendSrc, 'run').mockImplementation(() => {/*Emtpy*/});
    const runFrontend = vi.spyOn(moduleFrontendSrc, 'run').mockImplementation(() => {/*Emtpy*/});

    run({ name: 'pkg' }, { name: 'cfg' }, 'output');
    expect(runBackend).toHaveBeenCalledTimes(1);
    expect(runBackend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'output');
    expect(runFrontend).toHaveBeenCalledTimes(1);
    expect(runFrontend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'output');
  });

  it('validate compiling the project', () => {
    const compileBackend = vi.spyOn(moduleBackendSrc, 'compile').mockImplementation(() => {/*Emtpy*/});
    const compileFrontend = vi.spyOn(moduleFrontendSrc, 'compile').mockImplementation(() => {/*Emtpy*/});
    const makeDir = vi.spyOn(sysUtilsSrc, 'makeDir').mockImplementation(() => {/*Emtpy*/});
    const makeFile = vi.spyOn(sysUtilsSrc, 'makeFile').mockImplementation(() => {/*Emtpy*/});
    const copyFile = vi.spyOn(sysUtilsSrc, 'copyFile').mockImplementation(() => {/*Emtpy*/});

    // No dependencies available, no packages available, no homepage available, no pre/post-install scripts available
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    expect(compileBackend).toHaveBeenCalledTimes(1);
    expect(compileBackend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    expect(compileFrontend).toHaveBeenCalledTimes(1);
    expect(compileFrontend).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    expect(makeDir).toHaveBeenCalledTimes(3);
    expect(makeFile).toHaveBeenCalledTimes(6);
    expect(makeDir).toHaveBeenNthCalledWith(1, path.normalize('output/opt/cfg'));
    expect(makeFile).toHaveBeenNthCalledWith(1, path.normalize('output/opt/cfg/package.json'), '{"name":"cfg","version":"1.0.0","dependencies":{"glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
    expect(makeFile).toHaveBeenNthCalledWith(2, path.normalize('output/opt/cfg/glconfig.json'), '{"name":"cfg","version":"1.0.0"}');
    expect(makeDir).toHaveBeenNthCalledWith(2, path.normalize('output/etc/logrotate.d'));
    expect(makeFile).toHaveBeenNthCalledWith(3, path.normalize('output/etc/logrotate.d/cfg'), expect.any(String)); // Not validating the content of the logrotate file
    expect(makeDir).toHaveBeenNthCalledWith(3, path.normalize('output/etc/nginx/sites-available'));
    expect(makeFile).toHaveBeenNthCalledWith(4, path.normalize('output/etc/nginx/sites-available/cfg.gateway.conf'), expect.any(String)); // Not validating the content of the nginx config file
    expect(makeFile).toHaveBeenNthCalledWith(5, path.normalize('output/etc/nginx/sites-available/cfg.proxy.conf'), expect.any(String)); // Not validating the content of the nginx config file
    expect(makeFile).toHaveBeenNthCalledWith(6, path.normalize('output/install'), expect.stringContaining('dpkg -s cron logrotate nodejs nginx certbot python3-certbot-nginx > /dev/null 2>&1\n')); // Not validating the full content of the install file

    // Dependencies available, packages available, homepage available without subdomain, pre-install script available
    compile({ name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com/', packages: ['logrotate', 'example'], preinstall: './preinstall' }, 'input', 'output');
    expect(compileBackend).toHaveBeenCalledTimes(2);
    expect(compileBackend).toHaveBeenLastCalledWith({ name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com/', packages: ['logrotate', 'example'], preinstall: './preinstall' }, 'input', 'output');
    expect(compileFrontend).toHaveBeenCalledTimes(2);
    expect(compileFrontend).toHaveBeenLastCalledWith({ name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com/', packages: ['logrotate', 'example'], preinstall: './preinstall' }, 'input', 'output');
    expect(makeDir).toHaveBeenCalledTimes(7);
    expect(makeFile).toHaveBeenCalledTimes(12);
    expect(copyFile).toHaveBeenCalledTimes(1);
    expect(makeDir).toHaveBeenNthCalledWith(4, path.normalize('output/opt/cfg'));
    expect(makeFile).toHaveBeenNthCalledWith(7, path.normalize('output/opt/cfg/package.json'), '{"name":"cfg","version":"1.0.0","dependencies":{"hello":"world","glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
    expect(makeFile).toHaveBeenNthCalledWith(8, path.normalize('output/opt/cfg/glconfig.json'), '{"name":"cfg","version":"1.0.0","homepage":"https://example.com/","packages":["logrotate","example"],"preinstall":"./preinstall"}');
    expect(makeDir).toHaveBeenNthCalledWith(5, path.normalize('output/etc/logrotate.d'));
    expect(makeFile).toHaveBeenNthCalledWith(9, path.normalize('output/etc/logrotate.d/cfg'), expect.any(String)); // Not validating the content of the logrotate file
    expect(makeDir).toHaveBeenNthCalledWith(6, path.normalize('output/etc/nginx/sites-available'));
    expect(makeFile).toHaveBeenNthCalledWith(10, path.normalize('output/etc/nginx/sites-available/cfg.gateway.conf'), expect.any(String)); // Not validating the content of the nginx config file
    expect(makeFile).toHaveBeenNthCalledWith(11, path.normalize('output/etc/nginx/sites-available/cfg.proxy.conf'), expect.any(String)); // Not validating the content of the nginx config file
    expect(makeFile).toHaveBeenNthCalledWith(12, path.normalize('output/install'), expect.stringContaining('dpkg -s cron logrotate nodejs nginx certbot python3-certbot-nginx example > /dev/null 2>&1\n')); // Not validating the full content of the install file
    expect(makeFile).toHaveBeenNthCalledWith(12, path.normalize('output/install'), expect.stringContaining('certbot --nginx -d example.com -d www.example.com\n')); // Not validating the full content of the install file
    expect(makeFile).toHaveBeenNthCalledWith(12, path.normalize('output/install'), expect.stringContaining('chmod +x ./preinstall\n./preinstall\n\n')); // Not validating the full content of the install file
    expect(makeDir).toHaveBeenNthCalledWith(7, 'output');
    expect(copyFile).toHaveBeenLastCalledWith('./preinstall', path.normalize('output/preinstall'));

    // Dependencies available, packages available, homepage available with subdomain, post-install script available
    compile({ name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0', homepage: 'https://www.example.com/', packages: ['logrotate', 'example'], postinstall: './sub/postinstall', ports: { proxy: 9999 } }, 'input', 'output');
    expect(compileBackend).toHaveBeenCalledTimes(3);
    expect(compileBackend).toHaveBeenLastCalledWith({ name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0', homepage: 'https://www.example.com/', packages: ['logrotate', 'example'], postinstall: './sub/postinstall', ports: { proxy: 9999 } }, 'input', 'output');
    expect(compileFrontend).toHaveBeenCalledTimes(3);
    expect(compileFrontend).toHaveBeenLastCalledWith({ name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0', homepage: 'https://www.example.com/', packages: ['logrotate', 'example'], postinstall: './sub/postinstall', ports: { proxy: 9999 } }, 'input', 'output');
    expect(makeDir).toHaveBeenCalledTimes(11);
    expect(makeFile).toHaveBeenCalledTimes(18);
    expect(copyFile).toHaveBeenCalledTimes(2);
    expect(makeDir).toHaveBeenNthCalledWith(8, path.normalize('output/opt/cfg'));
    expect(makeFile).toHaveBeenNthCalledWith(13, path.normalize('output/opt/cfg/package.json'), '{"name":"cfg","version":"1.0.0","dependencies":{"hello":"world","glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
    expect(makeFile).toHaveBeenNthCalledWith(14, path.normalize('output/opt/cfg/glconfig.json'), '{"name":"cfg","version":"1.0.0","homepage":"https://www.example.com/","packages":["logrotate","example"],"postinstall":"./sub/postinstall","ports":{"proxy":9999}}');
    expect(makeDir).toHaveBeenNthCalledWith(9, path.normalize('output/etc/logrotate.d'));
    expect(makeFile).toHaveBeenNthCalledWith(15, path.normalize('output/etc/logrotate.d/cfg'), expect.any(String)); // Not validating the content of the logrotate file
    expect(makeDir).toHaveBeenNthCalledWith(10, path.normalize('output/etc/nginx/sites-available'));
    expect(makeFile).toHaveBeenNthCalledWith(16, path.normalize('output/etc/nginx/sites-available/cfg.gateway.conf'), expect.any(String)); // Not validating the content of the nginx config file
    expect(makeFile).toHaveBeenNthCalledWith(17, path.normalize('output/etc/nginx/sites-available/cfg.proxy.conf'), expect.any(String)); // Not validating the content of the nginx config file
    expect(makeFile).toHaveBeenNthCalledWith(18, path.normalize('output/install'), expect.stringContaining('dpkg -s cron logrotate nodejs nginx certbot python3-certbot-nginx example > /dev/null 2>&1\n')); // Not validating the full content of the install file
    expect(makeFile).toHaveBeenNthCalledWith(18, path.normalize('output/install'), expect.stringContaining('certbot --nginx -d www.example.com\n')); // Not validating the full content of the install file
    expect(makeFile).toHaveBeenNthCalledWith(18, path.normalize('output/install'), expect.stringContaining('chmod +x ./sub/postinstall\n./sub/postinstall\n\n')); // Not validating the full content of the install file
    expect(makeDir).toHaveBeenNthCalledWith(11, path.normalize('output/sub'));
    expect(copyFile).toHaveBeenLastCalledWith('./sub/postinstall', path.normalize('output/sub/postinstall'));
  });
});
