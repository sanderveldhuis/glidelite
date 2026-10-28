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
import * as moduleApiSrc from '../../src/compiler/moduleApi';
import {
  clean,
  compile,
  run,
  validate
} from '../../src/compiler/moduleBackend';
import * as moduleWorkersSrc from '../../src/compiler/moduleWorkers';
import * as sysUtilsSrc from '../../src/compiler/sysUtils';

describe('moduleBackend.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validate checking the backend', () => {
    const validateWorkers = vi.spyOn(moduleWorkersSrc, 'validate').mockImplementation(() => {/*Emtpy*/});
    const validateApi = vi.spyOn(moduleApiSrc, 'validate').mockImplementation(() => {/*Emtpy*/});

    validate({ name: 'pkg' }, { name: 'cfg' }, 'input');
    expect(validateWorkers).toHaveBeenCalledTimes(1);
    expect(validateWorkers).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'input');
    expect(validateApi).toHaveBeenCalledTimes(1);
    expect(validateApi).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'input');
  });

  it('validate cleaning the backend', () => {
    const cleanWorkers = vi.spyOn(moduleWorkersSrc, 'clean').mockImplementation(() => {/*Emtpy*/});
    const cleanApi = vi.spyOn(moduleApiSrc, 'clean').mockImplementation(() => {/*Emtpy*/});

    clean({ name: 'pkg' }, { name: 'cfg' }, 'output');
    expect(cleanWorkers).toHaveBeenCalledTimes(1);
    expect(cleanWorkers).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'output');
    expect(cleanApi).toHaveBeenCalledTimes(1);
    expect(cleanApi).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'output');
  });

  it('validate running the backend', () => {
    const runWorkers = vi.spyOn(moduleWorkersSrc, 'run').mockImplementation(() => {/*Emtpy*/});
    const runApi = vi.spyOn(moduleApiSrc, 'run').mockImplementation(() => {/*Emtpy*/});

    run({ name: 'pkg' }, { name: 'cfg' }, 'input');
    expect(runWorkers).toHaveBeenCalledTimes(1);
    expect(runWorkers).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'input');
    expect(runApi).toHaveBeenCalledTimes(1);
    expect(runApi).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'input');
  });

  it('validate compiling the backend', () => {
    const compileWorkers = vi.spyOn(moduleWorkersSrc, 'compile').mockImplementation(() => {/*Emtpy*/});
    const compileApi = vi.spyOn(moduleApiSrc, 'compile').mockImplementation(() => {/*Emtpy*/});
    const execute = vi.spyOn(sysUtilsSrc, 'execute');
    const readDir = vi.spyOn(sysUtilsSrc, 'readDir');
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});

    // No files available in API directory
    readDir.mockReturnValueOnce([]);
    compile({ name: 'pkg' }, { name: 'cfg' }, 'input1', 'output1');
    expect(readDir).toHaveBeenCalledTimes(1);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input1/backend'));

    // No files with .ts extension available in API directory
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test.tsx' }, { name: 'test.js' }]);
    compile({ name: 'pkg' }, { name: 'cfg' }, 'input2', 'output2');
    expect(readDir).toHaveBeenCalledTimes(2);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input2/backend'));

    // Files with .ts extension available in API directory but execution failed
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test1.ts', parentPath: 'path1' }]);
    execute.mockReturnValueOnce(false);
    compile({ name: 'pkg' }, { name: 'cfg' }, 'input3', 'output3');
    expect(readDir).toHaveBeenCalledTimes(3);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input3/backend'));
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenLastCalledWith(path.normalize('npm exec -- tsc -p input3 --rootDir input3 --outDir output3/opt/cfg'), 'input3');
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(3002);

    // Files with .ts extension available in API directory and execution succeeded
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test1.ts', parentPath: 'path1' }, { name: 'test2.ts', parentPath: 'path2' }]);
    execute.mockReturnValueOnce(true);
    compile({ name: 'pkg' }, { name: 'cfg' }, 'input4', 'output4');
    expect(readDir).toHaveBeenCalledTimes(4);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input4/backend'));
    expect(execute).toHaveBeenCalledTimes(2);
    expect(execute).toHaveBeenLastCalledWith(path.normalize('npm exec -- tsc -p input4 --rootDir input4 --outDir output4/opt/cfg'), 'input4');
    expect(compileWorkers).toHaveBeenCalledTimes(1);
    expect(compileWorkers).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'input4', 'output4');
    expect(compileApi).toHaveBeenCalledTimes(1);
    expect(compileApi).toHaveBeenLastCalledWith({ name: 'pkg' }, { name: 'cfg' }, 'input4', 'output4');
  });
});
