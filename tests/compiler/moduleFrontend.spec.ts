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

import child_process from 'node:child_process';
import path from 'node:path';
import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';
import {
  clean,
  compile,
  run,
  validate
} from '../../src/compiler/moduleFrontend';
import * as sysUtilsSrc from '../../src/compiler/sysUtils';

vi.mock('node:child_process');

describe('moduleFrontend.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validate checking the frontend', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const exists = vi.spyOn(sysUtilsSrc, 'exists');

    // All required files and directories exist
    exists.mockReturnValueOnce(true);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input1');
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenNthCalledWith(1, path.normalize('input1/frontend/vite.config.js'));

    // Not all required files and directories exist
    exists.mockReturnValue(false);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input2');
    expect(exists).toHaveBeenCalledTimes(7);
    expect(exists).toHaveBeenNthCalledWith(2, path.normalize('input2/frontend/vite.config.js'));
    expect(exists).toHaveBeenNthCalledWith(3, path.normalize('input2/frontend/vite.config.mjs'));
    expect(exists).toHaveBeenNthCalledWith(4, path.normalize('input2/frontend/vite.config.cjs'));
    expect(exists).toHaveBeenNthCalledWith(5, path.normalize('input2/frontend/vite.config.ts'));
    expect(exists).toHaveBeenNthCalledWith(6, path.normalize('input2/frontend/vite.config.mts'));
    expect(exists).toHaveBeenNthCalledWith(7, path.normalize('input2/frontend/vite.config.cts'));
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('error GL3001:', path.normalize("No valid project found at: 'input2', missing file 'input2/frontend/vite.config.ts'."));
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(3001);
  });

  it('validate cleaning the frontend', () => {
    const remove = vi.spyOn(sysUtilsSrc, 'remove').mockImplementation(() => {/*Emtpy*/});

    clean({ name: 'pkg' }, { name: 'cfg' }, 'output');
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenLastCalledWith(path.normalize('output/var/www/cfg'));
  });

  it('validate running the frontend', () => {
    // @ts-expect-error because function has return type ChildProcess
    const spawn = vi.spyOn(child_process, 'spawn').mockImplementation(() => {/*Emtpy*/});

    run({ name: 'pkg' }, { name: 'cfg' }, 'output');
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenLastCalledWith('npm exec -- vite', { shell: true, cwd: path.normalize('output/frontend'), stdio: 'inherit' });
  });

  it('validate compiling the frontend', () => {
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const remove = vi.spyOn(sysUtilsSrc, 'remove').mockImplementation(() => {/*Emtpy*/});
    const readDir = vi.spyOn(sysUtilsSrc, 'readDir');
    const exists = vi.spyOn(sysUtilsSrc, 'exists');
    const execute = vi.spyOn(sysUtilsSrc, 'execute');

    // No TypeScript validation needed and execution succeeded
    exists.mockReturnValueOnce(false);
    execute.mockReturnValueOnce(true);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input1', 'output');
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenLastCalledWith(path.normalize('input1/frontend/tsconfig.json'));
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenLastCalledWith(path.normalize('npm exec -- vite build --outDir output/var/www/cfg --emptyOutDir'), path.normalize('input1/frontend'));

    // No TypeScript validation needed and execution failed
    exists.mockReturnValueOnce(false);
    execute.mockReturnValueOnce(false);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input2', 'output');
    expect(exists).toHaveBeenCalledTimes(2);
    expect(exists).toHaveBeenLastCalledWith(path.normalize('input2/frontend/tsconfig.json'));
    expect(execute).toHaveBeenCalledTimes(2);
    expect(execute).toHaveBeenLastCalledWith(path.normalize('npm exec -- vite build --outDir output/var/www/cfg --emptyOutDir'), path.normalize('input2/frontend'));
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(3002);

    // TypeScript validation needed, no generated files available, execution succeeded
    exists.mockReturnValueOnce(true);
    readDir.mockReturnValueOnce([]);
    execute.mockReturnValueOnce(true).mockReturnValueOnce(true);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input3', 'output');
    expect(exists).toHaveBeenCalledTimes(3);
    expect(exists).toHaveBeenLastCalledWith(path.normalize('input3/frontend/tsconfig.json'));
    expect(readDir).toHaveBeenCalledTimes(1);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input3/frontend'));
    expect(execute).toHaveBeenCalledTimes(4);
    expect(execute).toHaveBeenNthCalledWith(3, 'npm exec -- tsc -b --noEmit', path.normalize('input3/frontend'));
    expect(execute).toHaveBeenNthCalledWith(4, path.normalize('npm exec -- vite build --outDir output/var/www/cfg --emptyOutDir'), path.normalize('input3/frontend'));

    // TypeScript validation needed, no generated files available, execution failed
    exists.mockReturnValueOnce(true);
    readDir.mockReturnValueOnce([]);
    execute.mockReturnValueOnce(false);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input4', 'output');
    expect(exists).toHaveBeenCalledTimes(4);
    expect(exists).toHaveBeenLastCalledWith(path.normalize('input4/frontend/tsconfig.json'));
    expect(readDir).toHaveBeenCalledTimes(2);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input4/frontend'));
    expect(execute).toHaveBeenCalledTimes(5);
    expect(execute).toHaveBeenLastCalledWith('npm exec -- tsc -b --noEmit', path.normalize('input4/frontend'));
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(3002);

    // TypeScript validation needed, no generated files available, execution failed
    exists.mockReturnValueOnce(true);
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test.tsbuildinfo.bak', parentPath: 'path1' }, { name: 'test.app.tsbuildinfo', parentPath: 'path2' }]);
    execute.mockReturnValueOnce(false);
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input5', 'output');
    expect(exists).toHaveBeenCalledTimes(5);
    expect(exists).toHaveBeenLastCalledWith(path.normalize('input5/frontend/tsconfig.json'));
    expect(readDir).toHaveBeenCalledTimes(3);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input5/frontend'));
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenLastCalledWith(path.normalize('path2/test.app.tsbuildinfo'));
    expect(execute).toHaveBeenCalledTimes(6);
    expect(execute).toHaveBeenLastCalledWith('npm exec -- tsc -b --noEmit', path.normalize('input5/frontend'));
    expect(processExit).toHaveBeenCalledTimes(3);
    expect(processExit).toHaveBeenLastCalledWith(3002);
  });
});
