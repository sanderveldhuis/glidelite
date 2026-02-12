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

import sinon from 'ts-sinon';
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
  let consoleError: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let cleanBackend: sinon.SinonStub;
  let compileBackend: sinon.SinonStub;
  let validateBackend: sinon.SinonStub;
  let runBackend: sinon.SinonStub;
  let cleanFrontend: sinon.SinonStub;
  let compileFrontend: sinon.SinonStub;
  let validateFrontend: sinon.SinonStub;
  let runFrontend: sinon.SinonStub;
  let remove: sinon.SinonStub;
  let makeDir: sinon.SinonStub;
  let makeFile: sinon.SinonStub;
  let copyFile: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    processExit = sinon.stub(process, 'exit');
    cleanBackend = sinon.stub(moduleBackendSrc, 'clean');
    compileBackend = sinon.stub(moduleBackendSrc, 'compile');
    validateBackend = sinon.stub(moduleBackendSrc, 'validate');
    runBackend = sinon.stub(moduleBackendSrc, 'run');
    cleanFrontend = sinon.stub(moduleFrontendSrc, 'clean');
    compileFrontend = sinon.stub(moduleFrontendSrc, 'compile');
    validateFrontend = sinon.stub(moduleFrontendSrc, 'validate');
    runFrontend = sinon.stub(moduleFrontendSrc, 'run');
    remove = sinon.stub(sysUtilsSrc, 'remove');
    makeDir = sinon.stub(sysUtilsSrc, 'makeDir');
    makeFile = sinon.stub(sysUtilsSrc, 'makeFile');
    copyFile = sinon.stub(sysUtilsSrc, 'copyFile');
  });

  afterEach(() => {
    consoleError.restore();
    processExit.restore();
    cleanBackend.restore();
    compileBackend.restore();
    validateBackend.restore();
    runBackend.restore();
    cleanFrontend.restore();
    compileFrontend.restore();
    validateFrontend.restore();
    runFrontend.restore();
    remove.restore();
    makeDir.restore();
    makeFile.restore();
    copyFile.restore();
  });

  it('validate checking the project', () => {
    // No homepage available
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input');
    sinon.assert.calledWithExactly(validateBackend.getCall(0), { name: 'pkg' }, { name: 'cfg' }, 'input');
    sinon.assert.calledWithExactly(validateFrontend.getCall(0), { name: 'pkg' }, { name: 'cfg' }, 'input');

    // Valid homepage
    validate({ name: 'pkg' }, { name: 'cfg', homepage: 'http://example.com' }, 'input');
    sinon.assert.calledWithExactly(validateBackend.getCall(1), { name: 'pkg' }, { name: 'cfg', homepage: 'http://example.com' }, 'input');
    sinon.assert.calledWithExactly(validateFrontend.getCall(1), { name: 'pkg' }, { name: 'cfg', homepage: 'http://example.com' }, 'input');
    validate({ name: 'pkg' }, { name: 'cfg', homepage: 'https://example.com' }, 'input');
    sinon.assert.calledWithExactly(validateBackend.getCall(2), { name: 'pkg' }, { name: 'cfg', homepage: 'https://example.com' }, 'input');
    sinon.assert.calledWithExactly(validateFrontend.getCall(2), { name: 'pkg' }, { name: 'cfg', homepage: 'https://example.com' }, 'input');

    // Invalid homepage type
    validate({ name: 'pkg' }, { name: 'cfg', homepage: 1 }, 'input');
    sinon.assert.calledWithExactly(validateBackend.getCall(3), { name: 'pkg' }, { name: 'cfg', homepage: 1 }, 'input');
    sinon.assert.calledWithExactly(validateFrontend.getCall(3), { name: 'pkg' }, { name: 'cfg', homepage: 1 }, 'input');
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL3001:', "No valid project found at: 'input', invalid homepage '1'.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 3001);
    validate({ name: 'pkg' }, { name: 'cfg', homepage: true }, 'input');
    sinon.assert.calledWithExactly(validateBackend.getCall(4), { name: 'pkg' }, { name: 'cfg', homepage: true }, 'input');
    sinon.assert.calledWithExactly(validateFrontend.getCall(4), { name: 'pkg' }, { name: 'cfg', homepage: true }, 'input');
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL3001:', "No valid project found at: 'input', invalid homepage 'true'.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 3001);
    validate({ name: 'pkg' }, { name: 'cfg', homepage: null }, 'input');
    sinon.assert.calledWithExactly(validateBackend.getCall(5), { name: 'pkg' }, { name: 'cfg', homepage: null }, 'input');
    sinon.assert.calledWithExactly(validateFrontend.getCall(5), { name: 'pkg' }, { name: 'cfg', homepage: null }, 'input');
    sinon.assert.calledWithExactly(consoleError.getCall(2), 'error GL3001:', "No valid project found at: 'input', invalid homepage 'null'.");
    sinon.assert.calledWithExactly(processExit.getCall(2), 3001);
    validate({ name: 'pkg' }, { name: 'cfg', homepage: { url: 'https://example.com/' } }, 'input');
    sinon.assert.calledWithExactly(validateBackend.getCall(6), { name: 'pkg' }, { name: 'cfg', homepage: { url: 'https://example.com/' } }, 'input');
    sinon.assert.calledWithExactly(validateFrontend.getCall(6), { name: 'pkg' }, { name: 'cfg', homepage: { url: 'https://example.com/' } }, 'input');
    sinon.assert.calledWithExactly(consoleError.getCall(3), 'error GL3001:', 'No valid project found at: \'input\', invalid homepage \'{"url":"https://example.com/"}\'.');
    sinon.assert.calledWithExactly(processExit.getCall(3), 3001);

    // Invalid homepage format
    validate({ name: 'pkg' }, { name: 'cfg', homepage: 'example.com' }, 'input');
    sinon.assert.calledWithExactly(validateBackend.getCall(7), { name: 'pkg' }, { name: 'cfg', homepage: 'example.com' }, 'input');
    sinon.assert.calledWithExactly(validateFrontend.getCall(7), { name: 'pkg' }, { name: 'cfg', homepage: 'example.com' }, 'input');
    sinon.assert.calledWithExactly(consoleError.getCall(4), 'error GL3001:', "No valid project found at: 'input', invalid homepage 'example.com'.");
    sinon.assert.calledWithExactly(processExit.getCall(4), 3001);
  });

  it('validate cleaning the project', () => {
    clean({ name: 'pkg' }, { name: 'cfg' }, 'output');
    sinon.assert.calledOnceWithExactly(cleanBackend, { name: 'pkg' }, { name: 'cfg' }, 'output');
    sinon.assert.calledOnceWithExactly(cleanFrontend, { name: 'pkg' }, { name: 'cfg' }, 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(remove.getCall(0), 'output\\install');
      sinon.assert.calledWithExactly(remove.getCall(1), 'output\\opt\\cfg');
      sinon.assert.calledWithExactly(remove.getCall(2), 'output\\etc\\logrotate.d');
      sinon.assert.calledWithExactly(remove.getCall(3), 'output\\etc\\nginx');
    }
    else {
      sinon.assert.calledWithExactly(remove.getCall(0), 'output/install');
      sinon.assert.calledWithExactly(remove.getCall(1), 'output/opt/cfg');
      sinon.assert.calledWithExactly(remove.getCall(2), 'output/etc/logrotate.d');
      sinon.assert.calledWithExactly(remove.getCall(3), 'output/etc/nginx');
    }
  });

  it('validate running the project', () => {
    run({ name: 'pkg' }, { name: 'cfg' }, 'output');
    sinon.assert.calledOnceWithExactly(runBackend, { name: 'pkg' }, { name: 'cfg' }, 'output');
    sinon.assert.calledOnceWithExactly(runFrontend, { name: 'pkg' }, { name: 'cfg' }, 'output');
  });

  it('validate compiling the project', () => {
    // No dependencies available, no packages available, no homepage available, no pre/post-install scripts available
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    sinon.assert.calledOnceWithExactly(compileBackend, { name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    sinon.assert.calledOnceWithExactly(compileFrontend, { name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(makeDir.getCall(0), 'output\\opt\\cfg');
      sinon.assert.calledWithExactly(makeFile.getCall(0), 'output\\opt\\cfg\\package.json', '{"name":"cfg","version":"1.0.0","dependencies":{"glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
      sinon.assert.calledWithExactly(makeFile.getCall(1), 'output\\opt\\cfg\\glconfig.json', '{"name":"cfg","version":"1.0.0"}');
      sinon.assert.calledWithExactly(makeDir.getCall(1), 'output\\etc\\logrotate.d');
      sinon.assert.calledWith(makeFile.getCall(2), 'output\\etc\\logrotate.d\\cfg'); // Not validating the content of the logrotate file
      sinon.assert.calledWithExactly(makeDir.getCall(2), 'output\\etc\\nginx\\sites-available');
      sinon.assert.calledWith(makeFile.getCall(3), 'output\\etc\\nginx\\sites-available\\cfg.gateway.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWith(makeFile.getCall(4), 'output\\etc\\nginx\\sites-available\\cfg.proxy.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWithMatch(makeFile.getCall(5), 'output\\install', 'dpkg -s cron logrotate nodejs nginx certbot python3-certbot-nginx > /dev/null 2>&1\n'); // Not validating the full content of the install file
    }
    else {
      sinon.assert.calledWithExactly(makeDir.getCall(0), 'output/opt/cfg');
      sinon.assert.calledWithExactly(makeFile.getCall(0), 'output/opt/cfg/package.json', '{"name":"cfg","version":"1.0.0","dependencies":{"glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
      sinon.assert.calledWithExactly(makeFile.getCall(1), 'output/opt/cfg/glconfig.json', '{"name":"cfg","version":"1.0.0"}');
      sinon.assert.calledWithExactly(makeDir.getCall(1), 'output/etc/logrotate.d');
      sinon.assert.calledWith(makeFile.getCall(2), 'output/etc/logrotate.d/cfg'); // Not validating the content of the logrotate file
      sinon.assert.calledWithExactly(makeDir.getCall(2), 'output/etc/nginx/sites-available');
      sinon.assert.calledWith(makeFile.getCall(3), 'output/etc/nginx/sites-available/cfg.gateway.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWith(makeFile.getCall(4), 'output/etc/nginx/sites-available/cfg.proxy.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWithMatch(makeFile.getCall(5), 'output/install', 'dpkg -s cron logrotate nodejs nginx certbot python3-certbot-nginx > /dev/null 2>&1\n'); // Not validating the full content of the install file
    }

    // Dependencies available, packages available, homepage available without subdomain, pre-install script available
    compile({ name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com/', packages: ['logrotate', 'example'], preinstall: './preinstall' }, 'input', 'output');
    sinon.assert.calledWithExactly(compileBackend.getCall(1), { name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com/', packages: ['logrotate', 'example'], preinstall: './preinstall' }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(makeDir.getCall(3), 'output\\opt\\cfg');
      sinon.assert.calledWithExactly(makeFile.getCall(6), 'output\\opt\\cfg\\package.json', '{"name":"cfg","version":"1.0.0","dependencies":{"hello":"world","glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
      sinon.assert.calledWithExactly(makeFile.getCall(7), 'output\\opt\\cfg\\glconfig.json', '{"name":"cfg","version":"1.0.0","homepage":"https://example.com/","packages":["logrotate","example"],"preinstall":"./preinstall"}');
      sinon.assert.calledWithExactly(makeDir.getCall(4), 'output\\etc\\logrotate.d');
      sinon.assert.calledWith(makeFile.getCall(8), 'output\\etc\\logrotate.d\\cfg'); // Not validating the content of the logrotate file
      sinon.assert.calledWithExactly(makeDir.getCall(5), 'output\\etc\\nginx\\sites-available');
      sinon.assert.calledWith(makeFile.getCall(9), 'output\\etc\\nginx\\sites-available\\cfg.gateway.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWith(makeFile.getCall(10), 'output\\etc\\nginx\\sites-available\\cfg.proxy.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWithMatch(makeFile.getCall(11), 'output\\install', 'dpkg -s cron logrotate nodejs nginx certbot python3-certbot-nginx example > /dev/null 2>&1\n'); // Not validating the full content of the install file
      sinon.assert.calledWithMatch(makeFile.getCall(11), 'output\\install', 'certbot --nginx -d example.com -d www.example.com\n'); // Not validating the full content of the install file
      sinon.assert.calledWithMatch(makeFile.getCall(11), 'output\\install', 'chmod +x ./preinstall\n./preinstall\n\n'); // Not validating the full content of the install file
      sinon.assert.calledWithExactly(makeDir.getCall(6), 'output');
      sinon.assert.calledWithExactly(copyFile.getCall(0), './preinstall', 'output\\preinstall');
    }
    else {
      sinon.assert.calledWithExactly(makeDir.getCall(3), 'output/opt/cfg');
      sinon.assert.calledWithExactly(makeFile.getCall(6), 'output/opt/cfg/package.json', '{"name":"cfg","version":"1.0.0","dependencies":{"hello":"world","glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
      sinon.assert.calledWithExactly(makeFile.getCall(7), 'output/opt/cfg/glconfig.json', '{"name":"cfg","version":"1.0.0","homepage":"https://example.com/","packages":["logrotate","example"],"preinstall":"./preinstall"}');
      sinon.assert.calledWithExactly(makeDir.getCall(4), 'output/etc/logrotate.d');
      sinon.assert.calledWith(makeFile.getCall(8), 'output/etc/logrotate.d/cfg'); // Not validating the content of the logrotate file
      sinon.assert.calledWithExactly(makeDir.getCall(5), 'output/etc/nginx/sites-available');
      sinon.assert.calledWith(makeFile.getCall(9), 'output/etc/nginx/sites-available/cfg.gateway.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWith(makeFile.getCall(10), 'output/etc/nginx/sites-available/cfg.proxy.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWithMatch(makeFile.getCall(11), 'output/install', 'dpkg -s cron logrotate nodejs nginx certbot python3-certbot-nginx example > /dev/null 2>&1\n'); // Not validating the full content of the install file
      sinon.assert.calledWithMatch(makeFile.getCall(11), 'output/install', 'certbot --nginx -d example.com -d www.example.com\n'); // Not validating the full content of the install file
      sinon.assert.calledWithMatch(makeFile.getCall(11), 'output/install', 'chmod +x ./preinstall\n./preinstall\n\n'); // Not validating the full content of the install file
      sinon.assert.calledWithExactly(makeDir.getCall(6), 'output');
      sinon.assert.calledWithExactly(copyFile.getCall(0), './preinstall', 'output/preinstall');
    }

    // Dependencies available, packages available, homepage available with subdomain, post-install script available
    compile({ name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0', homepage: 'https://www.example.com/', packages: ['logrotate', 'example'], postinstall: './sub/postinstall', ports: { proxy: 9999 } }, 'input', 'output');
    sinon.assert.calledWithExactly(compileBackend.getCall(2), { name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0', homepage: 'https://www.example.com/', packages: ['logrotate', 'example'], postinstall: './sub/postinstall', ports: { proxy: 9999 } }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(makeDir.getCall(7), 'output\\opt\\cfg');
      sinon.assert.calledWithExactly(makeFile.getCall(12), 'output\\opt\\cfg\\package.json', '{"name":"cfg","version":"1.0.0","dependencies":{"hello":"world","glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
      sinon.assert.calledWithExactly(makeFile.getCall(13), 'output\\opt\\cfg\\glconfig.json', '{"name":"cfg","version":"1.0.0","homepage":"https://www.example.com/","packages":["logrotate","example"],"postinstall":"./sub/postinstall","ports":{"proxy":9999}}');
      sinon.assert.calledWithExactly(makeDir.getCall(8), 'output\\etc\\logrotate.d');
      sinon.assert.calledWith(makeFile.getCall(14), 'output\\etc\\logrotate.d\\cfg'); // Not validating the content of the logrotate file
      sinon.assert.calledWithExactly(makeDir.getCall(9), 'output\\etc\\nginx\\sites-available');
      sinon.assert.calledWith(makeFile.getCall(15), 'output\\etc\\nginx\\sites-available\\cfg.gateway.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWith(makeFile.getCall(16), 'output\\etc\\nginx\\sites-available\\cfg.proxy.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWithMatch(makeFile.getCall(17), 'output\\install', 'dpkg -s cron logrotate nodejs nginx certbot python3-certbot-nginx example > /dev/null 2>&1\n'); // Not validating the full content of the install file
      sinon.assert.calledWithMatch(makeFile.getCall(17), 'output\\install', 'certbot --nginx -d www.example.com\n'); // Not validating the full content of the install file
      sinon.assert.calledWithMatch(makeFile.getCall(17), 'output\\install', 'chmod +x ./sub/postinstall\n./sub/postinstall\n\n'); // Not validating the full content of the install file
      sinon.assert.calledWithExactly(makeDir.getCall(10), 'output\\sub');
      sinon.assert.calledWithExactly(copyFile.getCall(1), './sub/postinstall', 'output\\sub\\postinstall');
    }
    else {
      sinon.assert.calledWithExactly(makeDir.getCall(7), 'output/opt/cfg');
      sinon.assert.calledWithExactly(makeFile.getCall(12), 'output/opt/cfg/package.json', '{"name":"cfg","version":"1.0.0","dependencies":{"hello":"world","glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
      sinon.assert.calledWithExactly(makeFile.getCall(13), 'output/opt/cfg/glconfig.json', '{"name":"cfg","version":"1.0.0","homepage":"https://www.example.com/","packages":["logrotate","example"],"postinstall":"./sub/postinstall","ports":{"proxy":9999}}');
      sinon.assert.calledWithExactly(makeDir.getCall(8), 'output/etc/logrotate.d');
      sinon.assert.calledWith(makeFile.getCall(14), 'output/etc/logrotate.d/cfg'); // Not validating the content of the logrotate file
      sinon.assert.calledWithExactly(makeDir.getCall(9), 'output/etc/nginx/sites-available');
      sinon.assert.calledWith(makeFile.getCall(15), 'output/etc/nginx/sites-available/cfg.gateway.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWith(makeFile.getCall(16), 'output/etc/nginx/sites-available/cfg.proxy.conf'); // Not validating the content of the nginx config file
      sinon.assert.calledWithMatch(makeFile.getCall(17), 'output/install', 'dpkg -s cron logrotate nodejs nginx certbot python3-certbot-nginx example > /dev/null 2>&1\n'); // Not validating the full content of the install file
      sinon.assert.calledWithMatch(makeFile.getCall(17), 'output/install', 'certbot --nginx -d www.example.com\n'); // Not validating the full content of the install file
      sinon.assert.calledWithMatch(makeFile.getCall(17), 'output/install', 'chmod +x ./sub/postinstall\n./sub/postinstall\n\n'); // Not validating the full content of the install file
      sinon.assert.calledWithExactly(makeDir.getCall(10), 'output/sub');
      sinon.assert.calledWithExactly(copyFile.getCall(1), './sub/postinstall', 'output/sub/postinstall');
    }
  });
});
