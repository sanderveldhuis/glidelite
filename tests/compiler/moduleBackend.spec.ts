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
import * as moduleApiSrc from '../../src/compiler/moduleApi';
import {
  clean,
  compile,
  run,
  validate
} from '../../src/compiler/moduleBackend';
import * as moduleWorkersSrc from '../../src/compiler/moduleWorkers';

describe('moduleBackend.ts', () => {
  let runApi: sinon.SinonStub;
  let cleanApi: sinon.SinonStub;
  let compileApi: sinon.SinonStub;
  let validateApi: sinon.SinonStub;
  let runWorkers: sinon.SinonStub;
  let cleanWorkers: sinon.SinonStub;
  let compileWorkers: sinon.SinonStub;
  let validateWorkers: sinon.SinonStub;

  beforeEach(() => {
    runApi = sinon.stub(moduleApiSrc, 'run');
    cleanApi = sinon.stub(moduleApiSrc, 'clean');
    compileApi = sinon.stub(moduleApiSrc, 'compile');
    validateApi = sinon.stub(moduleApiSrc, 'validate');
    runWorkers = sinon.stub(moduleWorkersSrc, 'run');
    cleanWorkers = sinon.stub(moduleWorkersSrc, 'clean');
    compileWorkers = sinon.stub(moduleWorkersSrc, 'compile');
    validateWorkers = sinon.stub(moduleWorkersSrc, 'validate');
  });

  afterEach(() => {
    runApi.restore();
    cleanApi.restore();
    compileApi.restore();
    validateApi.restore();
    runWorkers.restore();
    cleanWorkers.restore();
    compileWorkers.restore();
    validateWorkers.restore();
  });

  it('validate checking the backend', () => {
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input');
    sinon.assert.calledOnceWithExactly(validateWorkers, { name: 'pkg' }, { name: 'cfg' }, 'input');
    sinon.assert.calledOnceWithExactly(validateApi, { name: 'pkg' }, { name: 'cfg' }, 'input');
  });

  it('validate cleaning the backend', () => {
    clean({ name: 'pkg' }, { name: 'cfg' }, 'output');
    sinon.assert.calledOnceWithExactly(cleanWorkers, { name: 'pkg' }, { name: 'cfg' }, 'output');
    sinon.assert.calledOnceWithExactly(cleanApi, { name: 'pkg' }, { name: 'cfg' }, 'output');
  });

  it('validate running the backend', () => {
    run({ name: 'pkg' }, { name: 'cfg' }, 'input');
    sinon.assert.calledOnceWithExactly(runWorkers, { name: 'pkg' }, { name: 'cfg' }, 'input');
    sinon.assert.calledOnceWithExactly(runApi, { name: 'pkg' }, { name: 'cfg' }, 'input');
  });

  it('validate compiling the backend', () => {
    compile({ name: 'pkg' }, { name: 'cfg' }, 'input', 'output');
    sinon.assert.calledOnceWithExactly(compileWorkers, { name: 'pkg' }, { name: 'cfg' }, 'input', 'output');
    sinon.assert.calledOnceWithExactly(compileApi, { name: 'pkg' }, { name: 'cfg' }, 'input', 'output');
  });
});
