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

describe('compileProject.ts', () => {
  let cleanWorkers: sinon.SinonStub;
  let compileWorkers: sinon.SinonStub;
  let validateWorkers: sinon.SinonStub;

  beforeEach(() => {
    cleanWorkers = sinon.stub(compileWorkersSrc, 'clean');
    compileWorkers = sinon.stub(compileWorkersSrc, 'compile');
    validateWorkers = sinon.stub(compileWorkersSrc, 'validate');
  });

  afterEach(() => {
    cleanWorkers.restore();
    compileWorkers.restore();
    validateWorkers.restore();
  });

  it('validate checking the project', () => {
    validate({ name: 'cfg' }, { name: 'cfg' }, 'input');

    sinon.assert.calledOnceWithExactly(validateWorkers, { name: 'cfg' }, { name: 'cfg' }, 'input');
  });

  it('validate cleaning the project', () => {
    clean({ name: 'cfg' }, { name: 'cfg' }, 'output');

    sinon.assert.calledOnceWithExactly(cleanWorkers, { name: 'cfg' }, { name: 'cfg' }, 'output');
  });

  it('validate compiling the project', () => {
    compile({ name: 'cfg' }, { name: 'cfg' }, 'input', 'output');

    sinon.assert.calledOnceWithExactly(compileWorkers, { name: 'cfg' }, { name: 'cfg' }, 'input', 'output');
  });
});
