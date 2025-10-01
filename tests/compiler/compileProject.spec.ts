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
import {
  clean,
  compile,
  validate
} from '../../src/compiler/compileProject';
import * as compileWorkersSrc from '../../src/compiler/compileWorkers';
import * as sysUtilsSrc from '../../src/compiler/sysUtils';

describe('compileProject.ts', () => {
  let cleanWorkers: sinon.SinonStub;
  let compileWorkers: sinon.SinonStub;
  let validateWorkers: sinon.SinonStub;
  let remove: sinon.SinonStub;
  let makeDir: sinon.SinonStub;
  let makeFile: sinon.SinonStub;

  beforeEach(() => {
    cleanWorkers = sinon.stub(compileWorkersSrc, 'clean');
    compileWorkers = sinon.stub(compileWorkersSrc, 'compile');
    validateWorkers = sinon.stub(compileWorkersSrc, 'validate');
    remove = sinon.stub(sysUtilsSrc, 'remove');
    makeDir = sinon.stub(sysUtilsSrc, 'makeDir');
    makeFile = sinon.stub(sysUtilsSrc, 'makeFile');
  });

  afterEach(() => {
    cleanWorkers.restore();
    compileWorkers.restore();
    validateWorkers.restore();
    remove.restore();
    makeDir.restore();
    makeFile.restore();
  });

  it('validate checking the project', () => {
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input');
    sinon.assert.calledOnceWithExactly(validateWorkers, { name: 'pkg' }, { name: 'cfg' }, 'input');
  });

  it('validate cleaning the project', () => {
    clean({ name: 'pkg' }, { name: 'cfg' }, 'output');
    sinon.assert.calledOnceWithExactly(cleanWorkers, { name: 'pkg' }, { name: 'cfg' }, 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(remove.getCall(0), 'output\\install');
      sinon.assert.calledWithExactly(remove.getCall(1), 'output\\opt\\cfg');
    }
    else {
      sinon.assert.calledWithExactly(remove.getCall(0), 'output/install');
      sinon.assert.calledWithExactly(remove.getCall(1), 'output/opt/cfg');
    }
  });

  it('validate compiling the project', () => {
    // No dependencies available
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    sinon.assert.calledOnceWithExactly(compileWorkers, { name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledOnceWithExactly(makeDir, 'output\\opt\\cfg');
      sinon.assert.calledWithExactly(makeFile.getCall(0), 'output\\opt\\cfg\\package.json', '{"name":"cfg","version":"1.0.0","dependencies":{"glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
      sinon.assert.calledWithExactly(makeFile.getCall(1), 'output\\opt\\cfg\\glconfig.json', '{"name":"cfg","version":"1.0.0"}');
      sinon.assert.calledWith(makeFile.getCall(2), 'output\\install'); // Not validating the content of the make file
    }
    else {
      sinon.assert.calledOnceWithExactly(makeDir, 'output/opt/cfg');
      sinon.assert.calledWithExactly(makeFile.getCall(0), 'output/opt/cfg/package.json', '{"name":"cfg","version":"1.0.0","dependencies":{"glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
      sinon.assert.calledWithExactly(makeFile.getCall(1), 'output/opt/cfg/glconfig.json', '{"name":"cfg","version":"1.0.0"}');
      sinon.assert.calledWith(makeFile.getCall(2), 'output/install'); // Not validating the content of the make file
    }

    // Dependencies available
    compile({ name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    sinon.assert.calledWithExactly(compileWorkers.getCall(1), { name: 'pkg', dependencies: { hello: 'world', glidelite: '0.9.0' } }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(makeDir.getCall(1), 'output\\opt\\cfg');
      sinon.assert.calledWithExactly(makeFile.getCall(3), 'output\\opt\\cfg\\package.json', '{"name":"cfg","version":"1.0.0","dependencies":{"hello":"world","glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
      sinon.assert.calledWithExactly(makeFile.getCall(4), 'output\\opt\\cfg\\glconfig.json', '{"name":"cfg","version":"1.0.0"}');
      sinon.assert.calledWith(makeFile.getCall(5), 'output\\install'); // Not validating the content of the make file
    }
    else {
      sinon.assert.calledWithExactly(makeDir.getCall(1), 'output/opt/cfg');
      sinon.assert.calledWithExactly(makeFile.getCall(3), 'output/opt/cfg/package.json', '{"name":"cfg","version":"1.0.0","dependencies":{"hello":"world","glidelite":"github:sanderveldhuis/glidelite#v1.0.0"}}');
      sinon.assert.calledWithExactly(makeFile.getCall(4), 'output/opt/cfg/glconfig.json', '{"name":"cfg","version":"1.0.0"}');
      sinon.assert.calledWith(makeFile.getCall(5), 'output/install'); // Not validating the content of the make file
    }
  });
});
