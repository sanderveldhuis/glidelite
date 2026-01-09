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

import { expect } from 'chai';
import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';
import sinon from 'ts-sinon';
import {
  clean,
  compile,
  run,
  validate
} from '../../src/compiler/moduleWorkers';
import * as sysUtils from '../../src/compiler/sysUtils';

describe('moduleWorkers.ts', () => {
  let setTimeout: sinon.SinonStub;
  let consoleLog: sinon.SinonStub;
  let consoleError: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let watch: sinon.SinonStub;
  let spawn: sinon.SinonStub;
  let exists: sinon.SinonStub;
  let readDir: sinon.SinonStub;
  let readFile: sinon.SinonStub;
  let makeFile: sinon.SinonStub;
  let makeDir: sinon.SinonStub;
  let remove: sinon.SinonStub;
  let execute: sinon.SinonStub;

  beforeEach(() => {
    setTimeout = sinon.stub(global, 'setTimeout');
    consoleLog = sinon.stub(console, 'log');
    consoleError = sinon.stub(console, 'error');
    processExit = sinon.stub(process, 'exit');
    watch = sinon.stub(fs, 'watch');
    spawn = sinon.stub(childProcess, 'spawn');
    exists = sinon.stub(sysUtils, 'exists');
    readDir = sinon.stub(sysUtils, 'readDir');
    readFile = sinon.stub(sysUtils, 'readFile');
    makeFile = sinon.stub(sysUtils, 'makeFile');
    makeDir = sinon.stub(sysUtils, 'makeDir');
    remove = sinon.stub(sysUtils, 'remove');
    execute = sinon.stub(sysUtils, 'execute');
    // Ensure to call a timeout callback directly without delay
    setTimeout.callsFake((cb: () => void) => {
      cb();
    });
  });

  afterEach(() => {
    setTimeout.restore();
    consoleLog.restore();
    consoleError.restore();
    processExit.restore();
    watch.restore();
    spawn.restore();
    exists.restore();
    readDir.restore();
    readFile.restore();
    makeFile.restore();
    makeDir.restore();
    remove.restore();
    execute.restore();
  });

  it('validate checking the workers', () => {
    // All required files and directories exist
    exists.onCall(0).returns(true);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input1');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(0), 'input1\\backend\\workers\\tsconfig.json');
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(0), 'input1/backend/workers/tsconfig.json');
    }

    // Not all required files and directories exist
    exists.onCall(1).returns(false);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input2');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(1), 'input2\\backend\\workers\\tsconfig.json');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL3001:', "No valid project found at: 'input2', missing file 'input2\\backend\\workers\\tsconfig.json'.");
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(1), 'input2/backend/workers/tsconfig.json');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL3001:', "No valid project found at: 'input2', missing file 'input2/backend/workers/tsconfig.json'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 3001);
  });

  it('validate cleaning the workers', () => {
    clean({ name: 'pkg' }, { name: 'cfg' }, 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(remove.getCall(0), 'output\\opt\\cfg\\workers');
      sinon.assert.calledWithExactly(remove.getCall(1), 'output\\etc\\cron.d\\cfg_workers');
    }
    else {
      sinon.assert.calledWithExactly(remove.getCall(0), 'output/opt/cfg/workers');
      sinon.assert.calledWithExactly(remove.getCall(1), 'output/etc/cron.d/cfg_workers');
    }
  });

  it('validate running the workers', () => {
    let watchEvent;
    let watchCallback: (() => void) | undefined;
    watch.returns({
      on: (event: string, callback: () => void) => {
        watchEvent = event;
        watchCallback = callback;
      }
    });
    spawn.returns({ pid: 1234 });

    // No files available in workers directory
    readDir.onCall(0).returns([]);
    run({ name: 'pkg' }, { name: 'cfg' }, 'input');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readDir.getCall(0), 'input\\backend\\workers');
      sinon.assert.calledOnceWithExactly(watch, 'input\\backend\\workers', { recursive: true });
    }
    else {
      sinon.assert.calledWithExactly(readDir.getCall(0), 'input/backend/workers');
      sinon.assert.calledOnceWithExactly(watch, 'input/backend/workers', { recursive: true });
    }
    expect(watchEvent).to.equal('change');
    expect(watchCallback).to.not.equal(undefined);
    // Next if statement is for satisfying TypeScript as it should not be reached
    if (watchCallback === undefined) {
      return;
    }

    // Files with .ts extension available in workers directory, invalid instructions found
    // Validating all regexes are not part of this test, it will be done in another test
    readDir.onCall(1).returns([{ name: 'test1.ts', parentPath: 'path1' }, { name: 'test2.ts', parentPath: 'path2' }]);
    readFile.onCall(0).returns('"use strict";\n"glc task @test"\nconsole.log("done")');
    watchCallback();
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readDir.getCall(1), 'input\\backend\\workers');
      sinon.assert.calledWithExactly(readFile.getCall(0), 'path1\\test1.ts');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL3002:', "Invalid compiler instruction found in: 'path1\\test1.ts'.");
    }
    else {
      sinon.assert.calledWithExactly(readDir.getCall(1), 'input/backend/workers');
      sinon.assert.calledWithExactly(readFile.getCall(0), 'path1/test1.ts');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL3002:', "Invalid compiler instruction found in: 'path1/test1.ts'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 3002);

    // Files with .ts extension available in workers directory, valid instructions found
    // Validating all regexes are not part of this test, it will be done in another test
    if ('win32' === process.platform) {
      readDir.onCall(2).returns([{ name: 'test1.ts', parentPath: 'input\\backend\\workers\\sub1\\sub2' }, { name: 'test2.ts', parentPath: 'input\\backend\\workers\\sub2\\sub3' }]);
    }
    else {
      readDir.onCall(2).returns([{ name: 'test1.ts', parentPath: 'input/backend/workers/sub1/sub2' }, { name: 'test2.ts', parentPath: 'input/backend/workers/sub2/sub3' }]);
    }
    readFile.onCall(1).returns('"use strict";\n"glc task @yearly"\nconsole.log("done")').onCall(2).returns('"use strict";\n"glc service"\nconsole.log("done")');
    watchCallback();
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readDir.getCall(2), 'input\\backend\\workers');
      sinon.assert.calledWithExactly(readFile.getCall(1), 'input\\backend\\workers\\sub1\\sub2\\test1.ts');
      sinon.assert.calledWithExactly(readFile.getCall(2), 'input\\backend\\workers\\sub2\\sub3\\test2.ts');
      sinon.assert.calledWithExactly(consoleLog.getCall(0), "\x1b[93mSkipped worker: 'input\\backend\\workers\\sub1\\sub2\\test1.ts', only service workers are executed.\x1b[39m");
      sinon.assert.calledWithExactly(consoleLog.getCall(1), "\x1b[93mUse the following command to run the worker manually: 'npx ts-node input\\backend\\workers\\sub1\\sub2\\test1.ts'.\x1b[39m");
      sinon.assert.calledWithExactly(spawn.getCall(0), 'npm exec -- ts-node input\\backend\\workers\\sub2\\sub3\\test2.ts', { shell: true, cwd: 'input', stdio: 'inherit' });
    }
    else {
      sinon.assert.calledWithExactly(readDir.getCall(2), 'input/backend/workers');
      sinon.assert.calledWithExactly(readFile.getCall(1), 'input/backend/workers/sub1/sub2/test1.ts');
      sinon.assert.calledWithExactly(readFile.getCall(2), 'input/backend/workers/sub2/sub3/test2.ts');
      sinon.assert.calledWithExactly(consoleLog.getCall(0), "\x1b[93mSkipped worker: 'input/backend/workers/sub1/sub2/test1.ts', only service workers are executed.\x1b[39m");
      sinon.assert.calledWithExactly(consoleLog.getCall(1), "\x1b[93mUse the following command to run the worker manually: 'npx ts-node input/backend/workers/sub1/sub2/test1.ts'.\x1b[39m");
      sinon.assert.calledWithExactly(spawn.getCall(0), 'npm exec -- ts-node input/backend/workers/sub2/sub3/test2.ts', { shell: true, cwd: 'input', stdio: 'inherit' });
    }

    // Files with .ts extension available in workers directory, valid instructions found, and spawned processes should be killed
    // Validating all regexes are not part of this test, it will be done in another test
    if ('win32' === process.platform) {
      readDir.onCall(3).returns([{ name: 'test1.ts', parentPath: 'input\\backend\\workers\\sub1\\sub2' }, { name: 'test2.ts', parentPath: 'input\\backend\\workers\\sub2\\sub3' }]);
    }
    else {
      readDir.onCall(3).returns([{ name: 'test1.ts', parentPath: 'input/backend/workers/sub1/sub2' }, { name: 'test2.ts', parentPath: 'input/backend/workers/sub2/sub3' }]);
    }
    readFile.onCall(3).returns('"use strict";\n"glc task @yearly"\nconsole.log("done")').onCall(4).returns('"use strict";\n"glc task @monthly"\nconsole.log("done")');
    watchCallback();
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readDir.getCall(3), 'input\\backend\\workers');
      sinon.assert.calledWithExactly(readFile.getCall(3), 'input\\backend\\workers\\sub1\\sub2\\test1.ts');
      sinon.assert.calledWithExactly(readFile.getCall(4), 'input\\backend\\workers\\sub2\\sub3\\test2.ts');
      sinon.assert.calledWithExactly(consoleLog.getCall(2), "\x1b[93mSkipped worker: 'input\\backend\\workers\\sub2\\sub3\\test2.ts', only service workers are executed.\x1b[39m");
      sinon.assert.calledWithExactly(consoleLog.getCall(3), "\x1b[93mUse the following command to run the worker manually: 'npx ts-node input\\backend\\workers\\sub2\\sub3\\test2.ts'.\x1b[39m");
      sinon.assert.calledWithExactly(spawn.getCall(1), 'taskkill', ['/pid', '1234', '/f', '/t']);
    }
    else {
      sinon.assert.calledWithExactly(readDir.getCall(3), 'input/backend/workers');
      sinon.assert.calledWithExactly(readFile.getCall(3), 'input/backend/workers/sub1/sub2/test1.ts');
      sinon.assert.calledWithExactly(readFile.getCall(4), 'input/backend/workers/sub2/sub3/test2.ts');
      sinon.assert.calledWithExactly(consoleLog.getCall(2), "\x1b[93mSkipped worker: 'input/backend/workers/sub2/sub3/test2.ts', only service workers are executed.\x1b[39m");
      sinon.assert.calledWithExactly(consoleLog.getCall(3), "\x1b[93mUse the following command to run the worker manually: 'npx ts-node input/backend/workers/sub2/sub3/test2.ts'.\x1b[39m");
      sinon.assert.calledWithExactly(spawn.getCall(1), 'sh', ['-c', `kill -9 1234`]);
    }
  });

  it('validate compiling the workers', () => {
    // No files available in workers directory
    readDir.onCall(0).returns([]);
    compile({ name: 'pkg' }, { name: 'cfg' }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readDir.getCall(0), 'input\\backend\\workers');
    }
    else {
      sinon.assert.calledWithExactly(readDir.getCall(0), 'input/backend/workers');
    }

    // No files with .ts extension available in workers directory
    readDir.onCall(1).returns([{ name: 'test.tsx' }, { name: 'test.js' }]);
    compile({ name: 'pkg' }, { name: 'cfg' }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readDir.getCall(1), 'input\\backend\\workers');
    }
    else {
      sinon.assert.calledWithExactly(readDir.getCall(1), 'input/backend/workers');
    }

    // Files with .ts extension available in workers directory, but no instructions found
    readDir.onCall(2).returns([{ name: 'test1.ts', parentPath: 'path1' }, { name: 'test2.ts', parentPath: 'path2' }]);
    readFile.onCall(0).returns('').onCall(1).returns('');
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readDir.getCall(2), 'input\\backend\\workers');
      sinon.assert.calledWithExactly(readFile.getCall(0), 'path1\\test1.ts');
      sinon.assert.calledWithExactly(readFile.getCall(1), 'path2\\test2.ts');
    }
    else {
      sinon.assert.calledWithExactly(readDir.getCall(2), 'input/backend/workers');
      sinon.assert.calledWithExactly(readFile.getCall(0), 'path1/test1.ts');
      sinon.assert.calledWithExactly(readFile.getCall(1), 'path2/test2.ts');
    }

    // Files with .ts extension available in workers directory, invalid instructions found
    // Validating all regexes are not part of this test, it will be done in another test
    readDir.onCall(3).returns([{ name: 'test1.ts', parentPath: 'path1' }, { name: 'test2.ts', parentPath: 'path2' }]);
    readFile.onCall(2).returns('"use strict";\n"glc task @test"\nconsole.log("done")');
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readDir.getCall(3), 'input\\backend\\workers');
      sinon.assert.calledWithExactly(readFile.getCall(2), 'path1\\test1.ts');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL3002:', "Invalid compiler instruction found in: 'path1\\test1.ts'.");
    }
    else {
      sinon.assert.calledWithExactly(readDir.getCall(3), 'input/backend/workers');
      sinon.assert.calledWithExactly(readFile.getCall(2), 'path1/test1.ts');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL3002:', "Invalid compiler instruction found in: 'path1/test1.ts'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 3002);

    // Files with .ts extension available in workers directory, valid instructions found, but execution failed
    // Validating all regexes are not part of this test, it will be done in another test
    if ('win32' === process.platform) {
      readDir.onCall(4).returns([{ name: 'test1.ts', parentPath: 'input\\backend\\workers\\sub1\\sub2' }, { name: 'test2.ts', parentPath: 'input\\backend\\workers\\sub2\\sub3' }]);
    }
    else {
      readDir.onCall(4).returns([{ name: 'test1.ts', parentPath: 'input/backend/workers/sub1/sub2' }, { name: 'test2.ts', parentPath: 'input/backend/workers/sub2/sub3' }]);
    }
    readFile.onCall(3).returns('"use strict";\n"glc task @yearly"\nconsole.log("done")').onCall(4).returns('"use strict";\n"glc service"\nconsole.log("done")');
    execute.onCall(0).returns(false);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readDir.getCall(4), 'input\\backend\\workers');
      sinon.assert.calledOnceWithExactly(execute, 'npm exec -- tsc -p input\\backend\\workers --rootDir input\\backend\\workers --outDir output\\opt\\cfg\\workers', 'input');
      sinon.assert.calledWithExactly(readFile.getCall(3), 'input\\backend\\workers\\sub1\\sub2\\test1.ts');
      sinon.assert.calledWithExactly(readFile.getCall(4), 'input\\backend\\workers\\sub2\\sub3\\test2.ts');
    }
    else {
      sinon.assert.calledWithExactly(readDir.getCall(4), 'input/backend/workers');
      sinon.assert.calledOnceWithExactly(execute, 'npm exec -- tsc -p input/backend/workers --rootDir input/backend/workers --outDir output/opt/cfg/workers', 'input');
      sinon.assert.calledWithExactly(readFile.getCall(3), 'input/backend/workers/sub1/sub2/test1.ts');
      sinon.assert.calledWithExactly(readFile.getCall(4), 'input/backend/workers/sub2/sub3/test2.ts');
    }
    sinon.assert.calledWithExactly(processExit.getCall(1), 3002);

    // Files with .ts extension available in workers directory, valid instructions found, and execution succeeded
    // Validating all regexes are not part of this test, it will be done in another test
    if ('win32' === process.platform) {
      readDir.onCall(5).returns([{ name: 'test1.ts', parentPath: 'input\\backend\\workers\\sub1\\sub2' }, { name: 'test2.ts', parentPath: 'input\\backend\\workers\\sub2\\sub3' }]);
    }
    else {
      readDir.onCall(5).returns([{ name: 'test1.ts', parentPath: 'input/backend/workers/sub1/sub2' }, { name: 'test2.ts', parentPath: 'input/backend/workers/sub2/sub3' }]);
    }
    readFile.onCall(5).returns('"use strict";\n"glc task @yearly"\nconsole.log("done")').onCall(6).returns('"use strict";\n"glc service"\nconsole.log("done")');
    execute.onCall(1).returns(true);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readDir.getCall(5), 'input\\backend\\workers');
      sinon.assert.calledWithExactly(execute.getCall(1), 'npm exec -- tsc -p input\\backend\\workers --rootDir input\\backend\\workers --outDir output\\opt\\cfg\\workers', 'input');
      sinon.assert.calledWithExactly(readFile.getCall(5), 'input\\backend\\workers\\sub1\\sub2\\test1.ts');
      sinon.assert.calledWithExactly(readFile.getCall(6), 'input\\backend\\workers\\sub2\\sub3\\test2.ts');
      sinon.assert.calledOnceWithExactly(makeDir, 'output\\etc\\cron.d');
      sinon.assert.calledOnceWithExactly(makeFile, 'output\\etc\\cron.d\\cfg_workers', '@yearly root node /opt/cfg/workers/sub1/sub2/test1.js >> /var/log/cfg/workers.log &\n@reboot root node /opt/cfg/workers/sub2/sub3/test2.js >> /var/log/cfg/workers.log &\n* * * * * root ps aux | grep -v grep | grep -c "node /opt/cfg/workers/sub2/sub3/test2.js" || node /opt/cfg/workers/sub2/sub3/test2.js >> /var/log/cfg/workers.log &\n');
    }
    else {
      sinon.assert.calledWithExactly(readDir.getCall(5), 'input/backend/workers');
      sinon.assert.calledWithExactly(execute.getCall(1), 'npm exec -- tsc -p input/backend/workers --rootDir input/backend/workers --outDir output/opt/cfg/workers', 'input');
      sinon.assert.calledWithExactly(readFile.getCall(5), 'input/backend/workers/sub1/sub2/test1.ts');
      sinon.assert.calledWithExactly(readFile.getCall(6), 'input/backend/workers/sub2/sub3/test2.ts');
      sinon.assert.calledOnceWithExactly(makeDir, 'output/etc/cron.d');
      sinon.assert.calledOnceWithExactly(makeFile, 'output/etc/cron.d/cfg_workers', '@yearly root node /opt/cfg/workers/sub1/sub2/test1.js >> /var/log/cfg/workers.log &\n@reboot root node /opt/cfg/workers/sub2/sub3/test2.js >> /var/log/cfg/workers.log &\n* * * * * root ps aux | grep -v grep | grep -c "node /opt/cfg/workers/sub2/sub3/test2.js" || node /opt/cfg/workers/sub2/sub3/test2.js >> /var/log/cfg/workers.log &\n');
    }
  });

  it('validate regexes', () => {
    // TODO: add tests for all regexes
  });
});
