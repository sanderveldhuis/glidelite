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

import * as childProcess from 'node:child_process';
import sinon from 'ts-sinon';
import {
  clean,
  compile,
  run,
  validate
} from '../../src/compiler/compileFrontend';
import * as sysUtils from '../../src/compiler/sysUtils';

describe('compileFrontend.ts', () => {
  let consoleError: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let exists: sinon.SinonStub;
  let remove: sinon.SinonStub;
  let execute: sinon.SinonStub;
  let spawn: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    processExit = sinon.stub(process, 'exit');
    exists = sinon.stub(sysUtils, 'exists');
    remove = sinon.stub(sysUtils, 'remove');
    execute = sinon.stub(sysUtils, 'execute');
    spawn = sinon.stub(childProcess, 'spawn');
  });

  afterEach(() => {
    consoleError.restore();
    processExit.restore();
    exists.restore();
    remove.restore();
    execute.restore();
    spawn.restore();
  });

  it('validate checking the frontend', () => {
    // All required files and directories exist
    exists.onCall(0).returns(true);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input1');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(0), 'input1\\frontend\\vite.config.js');
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(0), 'input1/frontend/vite.config.js');
    }

    // Not all required files and directories exist
    exists.onCall(1).returns(false);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input2');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(1), 'input2\\frontend\\vite.config.js');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL3001:', "No valid project found at: 'input2', missing file 'input2\\frontend\\vite.config.js'.");
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(1), 'input2/frontend/vite.config.js');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL3001:', "No valid project found at: 'input2', missing file 'input2/frontend/vite.config.js'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 3001);
  });

  it('validate cleaning the frontend', () => {
    clean({ name: 'pkg' }, { name: 'cfg' }, 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledOnceWithExactly(remove, 'output\\var\\www\\cfg');
    }
    else {
      sinon.assert.calledOnceWithExactly(remove, 'output/var/www/cfg');
    }
  });

  it('validate running the frontend', () => {
    run({ name: 'pkg' }, { name: 'cfg' }, 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledOnceWithExactly(spawn, 'npm exec -- vite', { shell: true, cwd: 'output\\frontend', stdio: 'inherit' });
    }
    else {
      sinon.assert.calledOnceWithExactly(spawn, 'npm exec -- vite', { shell: true, cwd: 'output/frontend', stdio: 'inherit' });
    }
  });

  it('validate compiling the frontend', () => {
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledOnceWithExactly(execute, 'npm exec -- vite build --outDir output\\var\\www\\cfg --emptyOutDir', 'input\\frontend');
    }
    else {
      sinon.assert.calledOnceWithExactly(execute, 'npm exec -- vite build --outDir output/var/www/cfg --emptyOutDir', 'input/frontend');
    }
  });
});
