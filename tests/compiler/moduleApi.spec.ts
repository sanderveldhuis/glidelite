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
} from '../../src/compiler/moduleApi';
import * as sysUtils from '../../src/compiler/sysUtils';

describe('moduleApi.ts', () => {
  let setTimeout: sinon.SinonStub;
  let consoleError: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let watch: sinon.SinonStub;
  let spawn: sinon.SinonStub;
  let exists: sinon.SinonStub;
  let makeFile: sinon.SinonStub;
  let makeDir: sinon.SinonStub;
  let remove: sinon.SinonStub;
  let execute: sinon.SinonStub;

  beforeEach(() => {
    setTimeout = sinon.stub(global, 'setTimeout');
    consoleError = sinon.stub(console, 'error');
    processExit = sinon.stub(process, 'exit');
    watch = sinon.stub(fs, 'watch');
    spawn = sinon.stub(childProcess, 'spawn');
    exists = sinon.stub(sysUtils, 'exists');
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
    consoleError.restore();
    processExit.restore();
    watch.restore();
    spawn.restore();
    exists.restore();
    makeFile.restore();
    makeDir.restore();
    remove.restore();
    execute.restore();
  });

  it('validate checking the API', () => {
    // All required files and directories exist
    exists.onCall(0).returns(true)
      .onCall(1).returns(true);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input1');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(0), 'input1\\backend\\api\\tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'input1\\node_modules\\glidelite\\lib\\api.js');
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(0), 'input1/backend/api/tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'input1/node_modules/glidelite/lib/api.js');
    }

    // Not all required files and directories exist
    exists.onCall(2).returns(false);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input2');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(2), 'input2\\backend\\api\\tsconfig.json');
      sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL3001:', "No valid project found at: 'input2', missing file 'input2\\backend\\api\\tsconfig.json'.");
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(2), 'input2/backend/api/tsconfig.json');
      sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL3001:', "No valid project found at: 'input2', missing file 'input2/backend/api/tsconfig.json'.");
    }
    sinon.assert.calledWithExactly(processExit.getCall(0), 3001);

    // Not all required files and directories exist
    exists.onCall(3).returns(true)
      .onCall(4).returns(false);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input3');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(3), 'input3\\backend\\api\\tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(4), 'input3\\node_modules\\glidelite\\lib\\api.js');
      sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL3001:', "No valid GlideLite dependency found at: 'input3', missing file 'input3\\node_modules\\glidelite\\lib\\api.js'.");
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(3), 'input3/backend/api/tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(4), 'input3/node_modules/glidelite/lib/api.js');
      sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL3001:', "No valid GlideLite dependency found at: 'input3', missing file 'input3/node_modules/glidelite/lib/api.js'.");
    }
    sinon.assert.calledWithExactly(processExit.getCall(1), 3001);
  });

  it('validate cleaning the API', () => {
    clean({ name: 'pkg' }, { name: 'cfg' }, 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledOnceWithExactly(remove, 'output\\opt\\cfg\\api');
    }
    else {
      sinon.assert.calledOnceWithExactly(remove, 'output/opt/cfg/api');
    }
  });

  it('validate running the API', () => {
    let watchEvent;
    let watchCallback: (() => void) | undefined;
    watch.returns({
      on: (event: string, callback: () => void) => {
        watchEvent = event;
        watchCallback = callback;
      }
    });
    spawn.returns({ pid: 1234 });

    // Without API port in GlideLite configuration
    run({ name: 'pkg' }, { name: 'cfg' }, 'input');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(spawn.getCall(0), 'npm exec -- ts-node input\\node_modules\\glidelite\\lib\\api.js', { shell: true, cwd: 'input', stdio: 'inherit' });
      sinon.assert.calledWithExactly(watch.getCall(0), 'input\\backend\\api', { recursive: true });
    }
    else {
      sinon.assert.calledWithExactly(spawn.getCall(0), 'npm exec -- ts-node input/node_modules/glidelite/lib/api.js', { shell: true, cwd: 'input', stdio: 'inherit' });
      sinon.assert.calledWithExactly(watch.getCall(0), 'input/backend/api', { recursive: true });
    }
    expect(watchEvent).to.equal('change');
    expect(watchCallback).to.not.equal(undefined);
    // Next if statement is for satisfying TypeScript as it should not be reached
    if (watchCallback === undefined) {
      return;
    }

    // With API port in GlideLite configuration
    run({ name: 'pkg' }, { name: 'cfg', ports: { api: 1234 } }, 'input');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(spawn.getCall(1), 'npm exec -- ts-node input\\node_modules\\glidelite\\lib\\api.js 1234', { shell: true, cwd: 'input', stdio: 'inherit' });
      sinon.assert.calledWithExactly(watch.getCall(1), 'input\\backend\\api', { recursive: true });
    }
    else {
      sinon.assert.calledWithExactly(spawn.getCall(1), 'npm exec -- ts-node input/node_modules/glidelite/lib/api.js 1234', { shell: true, cwd: 'input', stdio: 'inherit' });
      sinon.assert.calledWithExactly(watch.getCall(1), 'input/backend/api', { recursive: true });
    }
    expect(watchEvent).to.equal('change');
    expect(watchCallback).to.not.equal(undefined);

    // Test the callback function
    watchCallback();
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(spawn.getCall(2), 'taskkill', ['/pid', '1234', '/f', '/t']);
      sinon.assert.calledWithExactly(spawn.getCall(3), 'npm exec -- ts-node input\\node_modules\\glidelite\\lib\\api.js 1234', { shell: true, cwd: 'input', stdio: 'inherit' });
    }
    else {
      sinon.assert.calledWithExactly(spawn.getCall(2), 'sh', ['-c', `kill -9 1234`]);
      sinon.assert.calledWithExactly(spawn.getCall(3), 'npm exec -- ts-node input/node_modules/glidelite/lib/api.js 1234', { shell: true, cwd: 'input', stdio: 'inherit' });
    }
  });

  it('validate compiling the API', () => {
    // Execution failed
    execute.onCall(0).returns(false);
    compile({ name: 'pkg' }, { name: 'cfg' }, 'input1', 'output1');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(execute.getCall(0), 'npm exec -- tsc -p input1\\backend\\api --rootDir input1\\backend\\api --outDir output1\\opt\\cfg\\api', 'input1');
    }
    else {
      sinon.assert.calledWithExactly(execute.getCall(0), 'npm exec -- tsc -p input1/backend/api --rootDir input1/backend/api --outDir output1/opt/cfg/api', 'input1');
    }
    sinon.assert.calledOnceWithExactly(processExit, 3002);

    // Execution succeeded
    execute.onCall(1).returns(true);
    compile({ name: 'pkg' }, { name: 'cfg' }, 'input2', 'output2');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(execute.getCall(1), 'npm exec -- tsc -p input2\\backend\\api --rootDir input2\\backend\\api --outDir output2\\opt\\cfg\\api', 'input2');
      sinon.assert.calledOnceWithExactly(makeDir, 'output2\\etc\\cron.d');
      sinon.assert.calledOnceWithExactly(makeFile, 'output2\\etc\\cron.d\\cfg_api', '@reboot root node /opt/cfg/node_modules/glidelite/lib/api.js >> /var/log/cfg/api.log &\n* * * * * root ps aux | grep -v grep | grep -c "node /opt/cfg/node_modules/glidelite/lib/api.js" || node /opt/cfg/node_modules/glidelite/lib/api.js >> /var/log/cfg/api.log &\n');
    }
    else {
      sinon.assert.calledWithExactly(execute.getCall(1), 'npm exec -- tsc -p input2/backend/api --rootDir input2/backend/api --outDir output2/opt/cfg/api', 'input2');
      sinon.assert.calledOnceWithExactly(makeDir, 'output2/etc/cron.d');
      sinon.assert.calledOnceWithExactly(makeFile, 'output2/etc/cron.d/cfg_api', '@reboot root node /opt/cfg/node_modules/glidelite/lib/api.js >> /var/log/cfg/api.log &\n* * * * * root ps aux | grep -v grep | grep -c "node /opt/cfg/node_modules/glidelite/lib/api.js" || node /opt/cfg/node_modules/glidelite/lib/api.js >> /var/log/cfg/api.log &\n');
    }
  });
});
