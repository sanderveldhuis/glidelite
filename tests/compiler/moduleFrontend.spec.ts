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
} from '../../src/compiler/moduleFrontend';
import * as sysUtils from '../../src/compiler/sysUtils';

describe('moduleFrontend.ts', () => {
  let consoleError: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let exists: sinon.SinonStub;
  let readDir: sinon.SinonStub;
  let remove: sinon.SinonStub;
  let execute: sinon.SinonStub;
  let spawn: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    processExit = sinon.stub(process, 'exit');
    exists = sinon.stub(sysUtils, 'exists');
    readDir = sinon.stub(sysUtils, 'readDir');
    remove = sinon.stub(sysUtils, 'remove');
    execute = sinon.stub(sysUtils, 'execute');
    spawn = sinon.stub(childProcess, 'spawn');
  });

  afterEach(() => {
    consoleError.restore();
    processExit.restore();
    exists.restore();
    readDir.restore();
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
    exists.onCall(2).returns(false);
    exists.onCall(3).returns(false);
    exists.onCall(4).returns(false);
    exists.onCall(5).returns(false);
    exists.onCall(6).returns(false);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input2');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(1), 'input2\\frontend\\vite.config.js');
      sinon.assert.calledWithExactly(exists.getCall(2), 'input2\\frontend\\vite.config.mjs');
      sinon.assert.calledWithExactly(exists.getCall(3), 'input2\\frontend\\vite.config.cjs');
      sinon.assert.calledWithExactly(exists.getCall(4), 'input2\\frontend\\vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(5), 'input2\\frontend\\vite.config.mts');
      sinon.assert.calledWithExactly(exists.getCall(6), 'input2\\frontend\\vite.config.cts');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL3001:', "No valid project found at: 'input2', missing file 'input2\\frontend\\vite.config.ts'.");
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(1), 'input2/frontend/vite.config.js');
      sinon.assert.calledWithExactly(exists.getCall(2), 'input2/frontend/vite.config.mjs');
      sinon.assert.calledWithExactly(exists.getCall(3), 'input2/frontend/vite.config.cjs');
      sinon.assert.calledWithExactly(exists.getCall(4), 'input2/frontend/vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(5), 'input2/frontend/vite.config.mts');
      sinon.assert.calledWithExactly(exists.getCall(6), 'input2/frontend/vite.config.cts');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL3001:', "No valid project found at: 'input2', missing file 'input2/frontend/vite.config.ts'.");
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
    // No TypeScript validation needed and execution succeeded
    exists.onCall(0).returns(false);
    execute.onCall(0).returns(true);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input1', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(0), 'input1\\frontend\\tsconfig.json');
      sinon.assert.calledWithExactly(execute.getCall(0), 'npm exec -- vite build --outDir output\\var\\www\\cfg --emptyOutDir', 'input1\\frontend');
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(0), 'input1/frontend/tsconfig.json');
      sinon.assert.calledWithExactly(execute.getCall(0), 'npm exec -- vite build --outDir output/var/www/cfg --emptyOutDir', 'input1/frontend');
    }

    // No TypeScript validation needed and execution failed
    exists.onCall(1).returns(false);
    execute.onCall(1).returns(false);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input2', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(1), 'input2\\frontend\\tsconfig.json');
      sinon.assert.calledWithExactly(execute.getCall(1), 'npm exec -- vite build --outDir output\\var\\www\\cfg --emptyOutDir', 'input2\\frontend');
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(1), 'input2/frontend/tsconfig.json');
      sinon.assert.calledWithExactly(execute.getCall(1), 'npm exec -- vite build --outDir output/var/www/cfg --emptyOutDir', 'input2/frontend');
    }
    sinon.assert.calledWithExactly(processExit.getCall(0), 3002);

    // TypeScript validation needed, no generated files available, execution succeeded
    exists.onCall(2).returns(true);
    readDir.onCall(0).returns([]);
    execute.onCall(2).returns(true);
    execute.onCall(3).returns(true);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input3', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(2), 'input3\\frontend\\tsconfig.json');
      sinon.assert.calledWithExactly(readDir.getCall(0), 'input3\\frontend');
      sinon.assert.calledWithExactly(execute.getCall(2), 'npm exec -- tsc -b --noEmit', 'input3\\frontend');
      sinon.assert.calledWithExactly(execute.getCall(3), 'npm exec -- vite build --outDir output\\var\\www\\cfg --emptyOutDir', 'input3\\frontend');
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(2), 'input3/frontend/tsconfig.json');
      sinon.assert.calledWithExactly(readDir.getCall(0), 'input3/frontend');
      sinon.assert.calledWithExactly(execute.getCall(2), 'npm exec -- tsc -b --noEmit', 'input3/frontend');
      sinon.assert.calledWithExactly(execute.getCall(3), 'npm exec -- vite build --outDir output/var/www/cfg --emptyOutDir', 'input3/frontend');
    }

    // TypeScript validation needed, no generated files available, execution failed
    exists.onCall(3).returns(true);
    readDir.onCall(1).returns([]);
    execute.onCall(4).returns(false);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input4', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(3), 'input4\\frontend\\tsconfig.json');
      sinon.assert.calledWithExactly(readDir.getCall(1), 'input4\\frontend');
      sinon.assert.calledWithExactly(execute.getCall(4), 'npm exec -- tsc -b --noEmit', 'input4\\frontend');
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(2), 'input4/frontend/tsconfig.json');
      sinon.assert.calledWithExactly(readDir.getCall(1), 'input4/frontend');
      sinon.assert.calledWithExactly(execute.getCall(4), 'npm exec -- tsc -b --noEmit', 'input4/frontend');
    }
    sinon.assert.calledWithExactly(processExit.getCall(1), 3002);

    // TypeScript validation needed, no generated files available, execution failed
    exists.onCall(4).returns(true);
    readDir.onCall(2).returns([{ name: 'test.tsbuildinfo.bak', parentPath: 'path1' }, { name: 'test.app.tsbuildinfo', parentPath: 'path2' }]);
    execute.onCall(5).returns(false);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input5', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(4), 'input5\\frontend\\tsconfig.json');
      sinon.assert.calledWithExactly(readDir.getCall(2), 'input5\\frontend');
      sinon.assert.calledOnceWithExactly(remove, 'path2\\test.app.tsbuildinfo');
      sinon.assert.calledWithExactly(execute.getCall(5), 'npm exec -- tsc -b --noEmit', 'input5\\frontend');
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(2), 'input5/frontend/tsconfig.json');
      sinon.assert.calledWithExactly(readDir.getCall(2), 'input5/frontend');
      sinon.assert.calledOnceWithExactly(remove, 'path2/test.app.tsbuildinfo');
      sinon.assert.calledWithExactly(execute.getCall(5), 'npm exec -- tsc -b --noEmit', 'input5/frontend');
    }
    sinon.assert.calledWithExactly(processExit.getCall(2), 3002);
  });
});
