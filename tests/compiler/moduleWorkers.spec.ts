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

import chokidar from 'chokidar';
import child_process from 'node:child_process';
import path from 'node:path';
import picocolors from 'picocolors';
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
} from '../../src/compiler/moduleWorkers';
import * as sysUtilsSrc from '../../src/compiler/sysUtils';

vi.mock('node:fs');
vi.mock('node:child_process');

describe('moduleWorkers.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validate checking the workers', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const exists = vi.spyOn(sysUtilsSrc, 'exists');
    vi.spyOn(picocolors, 'red').mockImplementation(input => input as string);

    // All required files and directories exist
    exists.mockReturnValueOnce(true);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input1');
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenNthCalledWith(1, path.normalize('input1/backend/workers'));

    // Not all required files and directories exist
    exists.mockReturnValueOnce(false);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input2');
    expect(exists).toHaveBeenCalledTimes(2);
    expect(exists).toHaveBeenNthCalledWith(2, path.normalize('input2/backend/workers'));
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith(`error GL3001: ${path.normalize("No valid project found at: 'input2', missing directory 'input2/backend/workers'.")}`);
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(3001);
  });

  it('validate cleaning the workers', () => {
    const remove = vi.spyOn(sysUtilsSrc, 'remove').mockImplementation(() => {/*Emtpy*/});

    clean({ name: 'pkg' }, { name: 'cfg' }, 'output');
    expect(remove).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenNthCalledWith(1, path.normalize('output/opt/cfg/workers'));
    expect(remove).toHaveBeenNthCalledWith(2, path.normalize('output/etc/cron.d/cfg_workers'));
  });

  it('validate running the workers', () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {/*Emtpy*/});
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    const readDir = vi.spyOn(sysUtilsSrc, 'readDir');
    const readFile = vi.spyOn(sysUtilsSrc, 'readFile');
    const spawn = vi.spyOn(child_process, 'spawn');
    const watch = vi.spyOn(chokidar, 'watch');
    // @ts-expect-error because function has return type Timeout
    vi.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
      cb();
      return 0;
    });
    vi.spyOn(picocolors, 'yellow').mockImplementation(input => input as string);
    vi.spyOn(picocolors, 'green').mockImplementation(input => input as string);
    vi.spyOn(picocolors, 'red').mockImplementation(input => input as string);
    vi.spyOn(picocolors, 'gray').mockImplementation(input => input as string);
    vi.spyOn(picocolors, 'cyan').mockImplementation(input => input as string);
    vi.spyOn(picocolors, 'bold').mockImplementation(input => input as string);
    vi.spyOn(picocolors, 'dim').mockImplementation(input => input as string);

    const watchEvent: string[] = [];
    const watchCallback: ((a?: string | number | Error, b?: string) => void)[] = [];
    // @ts-expect-error because object has missing types which are not used in the test
    spawn.mockReturnValue({ pid: 1234 });
    watch.mockReturnValue({
      // @ts-expect-error because function has return type FSWatcher
      on: (event: string, callback: () => void) => {
        watchEvent.push(event);
        watchCallback.push(callback);
        return 0;
      }
    });

    // No files available in workers directory
    readDir.mockReturnValueOnce([]);
    run({ name: 'pkg' }, { name: 'cfg' }, 'input');
    expect(readDir).toHaveBeenCalledTimes(1);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input/backend/workers'));
    expect(watch).toHaveBeenCalledTimes(2);
    expect(watch).toHaveBeenNthCalledWith(1, path.normalize('input/backend/workers'));
    expect(watch).toHaveBeenNthCalledWith(2, path.normalize('input/shared'));
    expect(watchEvent.length).to.equal(2);
    expect(watchEvent[0]).to.equal('ready');
    expect(watchEvent[1]).to.equal('ready');
    expect(watchCallback.length).to.equal(2);
    expect(watchCallback[0]).to.not.equal(undefined);
    expect(watchCallback[1]).to.not.equal(undefined);

    // Handle 'ready' event for both watchers
    watchCallback[0]();
    expect(watchEvent.length).to.equal(4);
    expect(watchEvent[2]).to.equal('all');
    expect(watchEvent[3]).to.equal('error');
    expect(watchCallback.length).to.equal(4);
    expect(watchCallback[2]).to.not.equal(undefined);
    expect(watchCallback[3]).to.not.equal(undefined);
    watchCallback[1]();
    expect(watchEvent.length).to.equal(6);
    expect(watchEvent[4]).to.equal('all');
    expect(watchEvent[5]).to.equal('error');
    expect(watchCallback.length).to.equal(6);
    expect(watchCallback[4]).to.not.equal(undefined);
    expect(watchCallback[5]).to.not.equal(undefined);

    // Handle 'all' event with directories for both watchers
    watchCallback[2]('changeDir', '');
    watchCallback[4]('changeDir', '');

    // Handle 'error' event for both watchers
    watchCallback[3](new Error('Test error'));
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith(`error GL2003: ${path.normalize("Failed watching files at: 'input/backend/workers', Test error.")}`);
    watchCallback[5](12);
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith(`error GL2003: ${path.normalize("Failed watching files at: 'input/shared'.")}`);

    // Files with .ts extension available in workers directory, invalid instructions found
    // Validating all regexes are not part of this test, it will be done in another test
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test1.ts', parentPath: 'path1' }, { name: 'test2.ts', parentPath: 'path2' }]);
    readFile.mockReturnValueOnce('"use strict";\n"glc task @test"\nconsole.log("done")');
    watchCallback[2]('change', 'input/backend/workers/path');
    expect(readDir).toHaveBeenCalledTimes(2);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input/backend/workers'));
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenLastCalledWith(path.normalize('path1/test1.ts'));
    expect(consoleLog).toHaveBeenCalledTimes(1);
    expect(consoleLog).toHaveBeenLastCalledWith(expect.any(String), '[glidelite]', '(worker)', 'source change', 'path');
    expect(consoleError).toHaveBeenCalledTimes(3);
    expect(consoleError).toHaveBeenLastCalledWith(`error GL3002: ${path.normalize("Invalid compiler instruction found in: 'path1/test1.ts'.")}`);

    // Files with .ts extension available in workers directory, valid instructions found
    // Validating all regexes are not part of this test, it will be done in another test
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test1.ts', parentPath: path.normalize('input/backend/workers/sub1/sub2') }, { name: 'test2.ts', parentPath: path.normalize('input/backend/workers/sub2/sub3') }]);
    readFile.mockReturnValueOnce('"use strict";\n"glc task @yearly"\nconsole.log("done")').mockReturnValueOnce('"use strict";\n"glc service"\nconsole.log("done")');
    watchCallback[4]('change', 'input/shared/path');
    expect(readDir).toHaveBeenCalledTimes(3);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input/backend/workers'));
    expect(readFile).toHaveBeenCalledTimes(3);
    expect(readFile).toHaveBeenNthCalledWith(2, path.normalize('input/backend/workers/sub1/sub2/test1.ts'));
    expect(readFile).toHaveBeenNthCalledWith(3, path.normalize('input/backend/workers/sub2/sub3/test2.ts'));
    expect(consoleLog).toHaveBeenCalledTimes(4);
    expect(consoleLog).toHaveBeenNthCalledWith(2, expect.any(String), '[glidelite]', '(shared)', 'source change', 'path');
    expect(consoleLog).toHaveBeenNthCalledWith(3, path.normalize("Skipped worker: 'input/backend/workers/sub1/sub2/test1.ts', only service workers are executed."));
    expect(consoleLog).toHaveBeenNthCalledWith(4, path.normalize("Use the following command to run the worker manually: 'npx ts-node input/backend/workers/sub1/sub2/test1.ts'."));
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenLastCalledWith(path.normalize('npm exec --silent -- ts-node input/backend/workers/sub2/sub3/test2.ts'), { shell: true, cwd: 'input', stdio: 'inherit' });

    // Files with .ts extension available in workers directory, valid instructions found, and spawned processes should be killed
    // Validating all regexes are not part of this test, it will be done in another test
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test1.ts', parentPath: path.normalize('input/backend/workers/sub1/sub2') }, { name: 'test2.ts', parentPath: path.normalize('input/backend/workers/sub2/sub3') }]);
    readFile.mockReturnValueOnce('"use strict";\n"glc task @yearly"\nconsole.log("done")').mockReturnValueOnce('"use strict";\n"glc task @monthly"\nconsole.log("done")');
    watchCallback[4]('change', 'input/shared/path');
    expect(readDir).toHaveBeenCalledTimes(4);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input/backend/workers'));
    expect(readFile).toHaveBeenCalledTimes(5);
    expect(readFile).toHaveBeenNthCalledWith(4, path.normalize('input/backend/workers/sub1/sub2/test1.ts'));
    expect(readFile).toHaveBeenNthCalledWith(5, path.normalize('input/backend/workers/sub2/sub3/test2.ts'));
    expect(consoleLog).toHaveBeenCalledTimes(7);
    expect(consoleLog).toHaveBeenNthCalledWith(5, expect.any(String), '[glidelite]', '(shared)', 'source change', 'path');
    expect(consoleLog).toHaveBeenNthCalledWith(6, path.normalize("Skipped worker: 'input/backend/workers/sub2/sub3/test2.ts', only service workers are executed."));
    expect(consoleLog).toHaveBeenNthCalledWith(7, path.normalize("Use the following command to run the worker manually: 'npx ts-node input/backend/workers/sub2/sub3/test2.ts'."));
    expect(spawn).toHaveBeenCalledTimes(2);
    if ('win32' === process.platform) {
      expect(spawn).toHaveBeenLastCalledWith('taskkill', ['/pid', '1234', '/f', '/t']);
    }
    else {
      expect(spawn).toHaveBeenLastCalledWith('sh', ['-c', `kill -9 1234`]);
    }

    // Files with .js extension available in workers directory, valid instructions found, JavaScript workers are run with node directly
    // Validating all regexes are not part of this test, it will be done in another test
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test1.js', parentPath: path.normalize('input/backend/workers/sub1/sub2') }, { name: 'test2.js', parentPath: path.normalize('input/backend/workers/sub2/sub3') }]);
    readFile.mockReturnValueOnce('"use strict";\n"glc task @yearly"\nconsole.log("done")').mockReturnValueOnce('"use strict";\n"glc service"\nconsole.log("done")');
    watchCallback[4]('change', 'input/shared/path');
    expect(readDir).toHaveBeenCalledTimes(5);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input/backend/workers'));
    expect(readFile).toHaveBeenCalledTimes(7);
    expect(readFile).toHaveBeenNthCalledWith(6, path.normalize('input/backend/workers/sub1/sub2/test1.js'));
    expect(readFile).toHaveBeenNthCalledWith(7, path.normalize('input/backend/workers/sub2/sub3/test2.js'));
    expect(consoleLog).toHaveBeenCalledTimes(10);
    expect(consoleLog).toHaveBeenNthCalledWith(8, expect.any(String), '[glidelite]', '(shared)', 'source change', 'path');
    expect(consoleLog).toHaveBeenNthCalledWith(9, path.normalize("Skipped worker: 'input/backend/workers/sub1/sub2/test1.js', only service workers are executed."));
    expect(consoleLog).toHaveBeenNthCalledWith(10, path.normalize("Use the following command to run the worker manually: 'node input/backend/workers/sub1/sub2/test1.js'."));
    expect(spawn).toHaveBeenCalledTimes(3);
    expect(spawn).toHaveBeenLastCalledWith(path.normalize('node input/backend/workers/sub2/sub3/test2.js'), { shell: true, cwd: 'input', stdio: 'inherit' });
  });

  it('validate compiling the workers', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const makeDir = vi.spyOn(sysUtilsSrc, 'makeDir').mockImplementation(() => {/*Emtpy*/});
    const makeFile = vi.spyOn(sysUtilsSrc, 'makeFile').mockImplementation(() => {/*Emtpy*/});
    const readDir = vi.spyOn(sysUtilsSrc, 'readDir');
    const readFile = vi.spyOn(sysUtilsSrc, 'readFile');
    vi.spyOn(picocolors, 'red').mockImplementation(input => input as string);

    // No files available in workers directory
    readDir.mockReturnValueOnce([]);
    compile({ name: 'pkg' }, { name: 'cfg' }, 'input', 'output');
    expect(readDir).toHaveBeenCalledTimes(1);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input/backend/workers'));

    // No files with .ts or .js extension available in workers directory
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test.tsx' }]);
    compile({ name: 'pkg' }, { name: 'cfg' }, 'input', 'output');
    expect(readDir).toHaveBeenCalledTimes(2);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input/backend/workers'));

    // Files with .ts extension available in workers directory, but no instructions found
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test1.ts', parentPath: 'path1' }, { name: 'test2.ts', parentPath: 'path2' }]);
    readFile.mockReturnValueOnce('').mockReturnValueOnce('');
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    expect(readDir).toHaveBeenCalledTimes(3);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input/backend/workers'));
    expect(readFile).toHaveBeenCalledTimes(2);
    expect(readFile).toHaveBeenNthCalledWith(1, path.normalize('path1/test1.ts'));
    expect(readFile).toHaveBeenNthCalledWith(2, path.normalize('path2/test2.ts'));

    // Files with .ts extension available in workers directory, invalid instructions found
    // Validating all regexes are not part of this test, it will be done in another test
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test1.ts', parentPath: 'path1' }, { name: 'test2.ts', parentPath: 'path2' }]);
    readFile.mockReturnValueOnce('"use strict";\n"glc task @test"\nconsole.log("done")');
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    expect(readDir).toHaveBeenCalledTimes(4);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input/backend/workers'));
    expect(readFile).toHaveBeenCalledTimes(3);
    expect(readFile).toHaveBeenLastCalledWith(path.normalize('path1/test1.ts'));
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith(`error GL3002: ${path.normalize("Invalid compiler instruction found in: 'path1/test1.ts'.")}`);
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(3002);

    // Files with .ts extension available in workers directory, valid instructions found, and execution succeeded
    // Validating all regexes are not part of this test, it will be done in another test
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test1.ts', parentPath: path.normalize('input/backend/workers/sub1/sub2') }, { name: 'test2.ts', parentPath: path.normalize('input/backend/workers/sub2/sub3') }]);
    readFile.mockReturnValueOnce('"use strict";\n"glc task @yearly"\nconsole.log("done")').mockReturnValueOnce('"use strict";\n"glc service"\nconsole.log("done")');
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    expect(readDir).toHaveBeenCalledTimes(5);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input/backend/workers'));
    expect(readFile).toHaveBeenCalledTimes(5);
    expect(readFile).toHaveBeenNthCalledWith(4, path.normalize('input/backend/workers/sub1/sub2/test1.ts'));
    expect(readFile).toHaveBeenNthCalledWith(5, path.normalize('input/backend/workers/sub2/sub3/test2.ts'));
    expect(makeDir).toHaveBeenCalledTimes(1);
    expect(makeDir).toHaveBeenLastCalledWith(path.normalize('output/etc/cron.d'));
    expect(makeFile).toHaveBeenCalledTimes(1);
    expect(makeFile).toHaveBeenLastCalledWith(path.normalize('output/etc/cron.d/cfg_workers'), '@yearly root node /opt/cfg/backend/workers/sub1/sub2/test1.js >> /var/log/cfg/workers.log &\n@reboot root node /opt/cfg/backend/workers/sub2/sub3/test2.js >> /var/log/cfg/workers.log &\n* * * * * root ps aux | grep -v grep | grep -c "node /opt/cfg/backend/workers/sub2/sub3/test2.js" || node /opt/cfg/backend/workers/sub2/sub3/test2.js >> /var/log/cfg/workers.log &\n');

    // Files with .js extension available in workers directory, valid instructions found, and no compilation required
    // Validating all regexes are not part of this test, it will be done in another test
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test1.js', parentPath: path.normalize('input/backend/workers/sub1/sub2') }, { name: 'test2.js', parentPath: path.normalize('input/backend/workers/sub2/sub3') }]);
    readFile.mockReturnValueOnce('"use strict";\n"glc task @yearly"\nconsole.log("done")').mockReturnValueOnce('"use strict";\n"glc service"\nconsole.log("done")');
    compile({ name: 'pkg' }, { name: 'cfg', version: '1.0.0' }, 'input', 'output');
    expect(readDir).toHaveBeenCalledTimes(6);
    expect(readDir).toHaveBeenLastCalledWith(path.normalize('input/backend/workers'));
    expect(readFile).toHaveBeenCalledTimes(7);
    expect(readFile).toHaveBeenNthCalledWith(6, path.normalize('input/backend/workers/sub1/sub2/test1.js'));
    expect(readFile).toHaveBeenNthCalledWith(7, path.normalize('input/backend/workers/sub2/sub3/test2.js'));
    expect(makeDir).toHaveBeenCalledTimes(2);
    expect(makeDir).toHaveBeenLastCalledWith(path.normalize('output/etc/cron.d'));
    expect(makeFile).toHaveBeenCalledTimes(2);
    expect(makeFile).toHaveBeenLastCalledWith(path.normalize('output/etc/cron.d/cfg_workers'), '@yearly root node /opt/cfg/backend/workers/sub1/sub2/test1.js >> /var/log/cfg/workers.log &\n@reboot root node /opt/cfg/backend/workers/sub2/sub3/test2.js >> /var/log/cfg/workers.log &\n* * * * * root ps aux | grep -v grep | grep -c "node /opt/cfg/backend/workers/sub2/sub3/test2.js" || node /opt/cfg/backend/workers/sub2/sub3/test2.js >> /var/log/cfg/workers.log &\n');
  });

  it('validate regexes', () => {
    // TODO: add tests for all regexes
  });
});
