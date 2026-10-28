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
import fs from 'node:fs';
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
} from '../../src/compiler/moduleApi';
import * as sysUtilsSrc from '../../src/compiler/sysUtils';

vi.mock('node:fs');
vi.mock('node:child_process');

describe('moduleApi.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validate checking the API', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const exists = vi.spyOn(sysUtilsSrc, 'exists');

    // All required files and directories exist
    exists.mockReturnValueOnce(true).mockReturnValueOnce(true);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input1');
    if ('win32' === process.platform) {
      expect(exists).toHaveBeenCalledTimes(2);
      expect(exists).toHaveBeenNthCalledWith(1, 'input1\\backend\\api\\routers');
      expect(exists).toHaveBeenNthCalledWith(2, 'input1\\node_modules\\glidelite\\lib\\apiserver\\run.js');
    }
    else {
      expect(exists).toHaveBeenCalledTimes(2);
      expect(exists).toHaveBeenNthCalledWith(1, 'input1/backend/api/routers');
      expect(exists).toHaveBeenNthCalledWith(2, 'input1/node_modules/glidelite/lib/apiserver/run.js');
    }

    // Not all required files and directories exist
    exists.mockReturnValueOnce(false);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input2');
    if ('win32' === process.platform) {
      expect(exists).toHaveBeenCalledTimes(3);
      expect(exists).toHaveBeenLastCalledWith('input2\\backend\\api\\routers');
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenLastCalledWith('error GL3001:', "No valid project found at: 'input2', missing directory 'input2\\backend\\api\\routers'.");
    }
    else {
      expect(exists).toHaveBeenCalledTimes(3);
      expect(exists).toHaveBeenLastCalledWith('input2/backend/api/routers');
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenLastCalledWith('error GL3001:', "No valid project found at: 'input2', missing directory 'input2/backend/api/routers'.");
    }
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(3001);

    // Not all required files and directories exist
    exists.mockReturnValueOnce(true).mockReturnValueOnce(false);
    validate({ name: 'pkg' }, { name: 'cfg' }, 'input3');
    if ('win32' === process.platform) {
      expect(exists).toHaveBeenCalledTimes(5);
      expect(exists).toHaveBeenNthCalledWith(4, 'input3\\backend\\api\\routers');
      expect(exists).toHaveBeenNthCalledWith(5, 'input3\\node_modules\\glidelite\\lib\\apiserver\\run.js');
      expect(consoleError).toHaveBeenCalledTimes(2);
      expect(consoleError).toHaveBeenLastCalledWith('error GL3001:', "No valid GlideLite dependency found at: 'input3', missing file 'input3\\node_modules\\glidelite\\lib\\apiserver\\run.js'.");
    }
    else {
      expect(exists).toHaveBeenCalledTimes(5);
      expect(exists).toHaveBeenNthCalledWith(4, 'input3/backend/api/routers');
      expect(exists).toHaveBeenNthCalledWith(5, 'input3/node_modules/glidelite/lib/apiserver/run.js');
      expect(consoleError).toHaveBeenCalledTimes(2);
      expect(consoleError).toHaveBeenLastCalledWith('error GL3001:', "No valid GlideLite dependency found at: 'input3', missing file 'input3/node_modules/glidelite/lib/apiserver/run.js'.");
    }
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(3001);
  });

  it('validate cleaning the API', () => {
    const remove = vi.spyOn(sysUtilsSrc, 'remove').mockImplementation(() => {/*Emtpy*/});

    clean({ name: 'pkg' }, { name: 'cfg' }, 'output');
    if ('win32' === process.platform) {
      expect(remove).toHaveBeenCalledTimes(2);
      expect(remove).toHaveBeenNthCalledWith(1, 'output\\opt\\cfg\\api');
      expect(remove).toHaveBeenNthCalledWith(2, 'output\\etc\\cron.d\\cfg_api');
    }
    else {
      expect(remove).toHaveBeenCalledTimes(2);
      expect(remove).toHaveBeenNthCalledWith(1, 'output/opt/cfg/api');
      expect(remove).toHaveBeenNthCalledWith(2, 'output/etc/cron.d/cfg_api');
    }
  });

  it('validate running the API', () => {
    const execute = vi.spyOn(sysUtilsSrc, 'execute');
    const readDir = vi.spyOn(sysUtilsSrc, 'readDir');
    const remove = vi.spyOn(sysUtilsSrc, 'remove').mockImplementation(() => {/*Emtpy*/});
    const spawn = vi.spyOn(child_process, 'spawn');
    const watch = vi.spyOn(fs, 'watch');
    // @ts-expect-error because function has return type Timeout
    vi.spyOn(global, 'setTimeout').mockImplementation((cb: () => void) => {
      cb();
      return 0;
    });

    const watchEvent: string[] = [];
    const watchCallback: (() => void)[] = [];
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

    // Without API port in GlideLite configuration and no TypeScript files available
    readDir.mockReturnValueOnce([]);
    run({ name: 'pkg' }, { name: 'cfg' }, 'input');
    if ('win32' === process.platform) {
      expect(remove).toHaveBeenCalledTimes(1);
      expect(remove).toHaveBeenLastCalledWith('input\\node_modules\\.tmp\\glc');
      expect(readDir).toHaveBeenCalledTimes(1);
      expect(readDir).toHaveBeenLastCalledWith('input\\backend\\api');
      expect(spawn).toHaveBeenCalledTimes(1);
      expect(spawn).toHaveBeenLastCalledWith('node input\\node_modules\\glidelite\\lib\\apiserver\\run.js', { shell: true, cwd: 'input', stdio: 'inherit' });
      expect(watch).toHaveBeenCalledTimes(2);
      expect(watch).toHaveBeenNthCalledWith(1, 'input\\backend\\api', { recursive: true });
      expect(watch).toHaveBeenNthCalledWith(2, 'input\\shared', { recursive: true });
    }
    else {
      expect(remove).toHaveBeenCalledTimes(1);
      expect(remove).toHaveBeenLastCalledWith('input/node_modules/.tmp/glc');
      expect(readDir).toHaveBeenCalledTimes(1);
      expect(readDir).toHaveBeenLastCalledWith('input/backend/api');
      expect(spawn).toHaveBeenCalledTimes(1);
      expect(spawn).toHaveBeenLastCalledWith('node input/node_modules/glidelite/lib/apiserver/run.js', { shell: true, cwd: 'input', stdio: 'inherit' });
      expect(watch).toHaveBeenCalledTimes(2);
      expect(watch).toHaveBeenNthCalledWith(1, 'input/backend/api', { recursive: true });
      expect(watch).toHaveBeenNthCalledWith(2, 'input/shared', { recursive: true });
    }
    expect(watchEvent.length).to.equal(2);
    expect(watchEvent[0]).to.equal('change');
    expect(watchEvent[1]).to.equal('change');
    expect(watchCallback.length).to.equal(2);
    expect(watchCallback[0]).to.not.equal(undefined);
    expect(watchCallback[1]).to.not.equal(undefined);

    // With API port in GlideLite configuration, TypeScript files available, and a sucessful execute
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test.ts' }, { name: 'test.js' }]);
    execute.mockReturnValueOnce(true);
    run({ name: 'pkg' }, { name: 'cfg', ports: { api: 1234 } }, 'input');
    if ('win32' === process.platform) {
      expect(remove).toHaveBeenCalledTimes(2);
      expect(remove).toHaveBeenLastCalledWith('input\\node_modules\\.tmp\\glc');
      expect(readDir).toHaveBeenCalledTimes(2);
      expect(readDir).toHaveBeenLastCalledWith('input\\backend\\api');
      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenLastCalledWith('npm exec -- tsc -p input --rootDir input --outDir input\\node_modules\\.tmp\\glc', 'input');
      expect(spawn).toHaveBeenCalledTimes(2);
      expect(spawn).toHaveBeenLastCalledWith('node input\\node_modules\\glidelite\\lib\\apiserver\\run.js 1234', { shell: true, cwd: 'input', stdio: 'inherit' });
      expect(watch).toHaveBeenCalledTimes(4);
      expect(watch).toHaveBeenNthCalledWith(3, 'input\\backend\\api', { recursive: true });
      expect(watch).toHaveBeenNthCalledWith(4, 'input\\shared', { recursive: true });
    }
    else {
      expect(remove).toHaveBeenCalledTimes(2);
      expect(remove).toHaveBeenLastCalledWith('input/node_modules/.tmp/glc');
      expect(readDir).toHaveBeenCalledTimes(2);
      expect(readDir).toHaveBeenLastCalledWith('input/backend/api');
      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenLastCalledWith('npm exec -- tsc -p input --rootDir input --outDir input/node_modules/.tmp/glc', 'input');
      expect(spawn).toHaveBeenCalledTimes(2);
      expect(spawn).toHaveBeenLastCalledWith('node input/node_modules/glidelite/lib/apiserver/run.js 1234', { shell: true, cwd: 'input', stdio: 'inherit' });
      expect(watch).toHaveBeenCalledTimes(4);
      expect(watch).toHaveBeenNthCalledWith(3, 'input/backend/api', { recursive: true });
      expect(watch).toHaveBeenNthCalledWith(4, 'input/shared', { recursive: true });
    }
    expect(watchEvent.length).to.equal(4);
    expect(watchEvent[2]).to.equal('change');
    expect(watchEvent[3]).to.equal('change');
    expect(watchCallback.length).to.equal(4);
    expect(watchCallback[2]).to.not.equal(undefined);
    expect(watchCallback[3]).to.not.equal(undefined);

    // Test the callback function with TypeScript files available but a failing execute
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test.tsx' }, { name: 'test.ts' }]);
    execute.mockReturnValueOnce(false);
    watchCallback[2]();
    if ('win32' === process.platform) {
      expect(spawn).toHaveBeenCalledTimes(3);
      expect(spawn).toHaveBeenLastCalledWith('taskkill', ['/pid', '1234', '/f', '/t']);
      expect(remove).toHaveBeenCalledTimes(3);
      expect(remove).toHaveBeenLastCalledWith('input\\node_modules\\.tmp\\glc');
      expect(readDir).toHaveBeenCalledTimes(3);
      expect(readDir).toHaveBeenLastCalledWith('input\\backend\\api');
      expect(execute).toHaveBeenCalledTimes(2);
      expect(execute).toHaveBeenLastCalledWith('npm exec -- tsc -p input --rootDir input --outDir input\\node_modules\\.tmp\\glc', 'input');
    }
    else {
      expect(spawn).toHaveBeenCalledTimes(3);
      expect(spawn).toHaveBeenLastCalledWith('sh', ['-c', `kill -9 1234`]);
      expect(remove).toHaveBeenCalledTimes(3);
      expect(remove).toHaveBeenLastCalledWith('input/node_modules/.tmp/glc');
      expect(readDir).toHaveBeenCalledTimes(3);
      expect(readDir).toHaveBeenLastCalledWith('input/backend/api');
      expect(execute).toHaveBeenCalledTimes(2);
      expect(execute).toHaveBeenLastCalledWith('npm exec -- tsc -p input --rootDir input --outDir input/node_modules/.tmp/glc', 'input');
    }

    // Test the callback function with TypeScript files available but a failing execute
    // @ts-expect-error because object has missing types which are not used in the test
    readDir.mockReturnValueOnce([{ name: 'test.tsx' }, { name: 'test.ts' }]);
    execute.mockReturnValueOnce(false);
    watchCallback[3]();
    if ('win32' === process.platform) {
      expect(spawn).toHaveBeenCalledTimes(4);
      expect(spawn).toHaveBeenLastCalledWith('taskkill', ['/pid', '1234', '/f', '/t']);
      expect(remove).toHaveBeenCalledTimes(4);
      expect(remove).toHaveBeenLastCalledWith('input\\node_modules\\.tmp\\glc');
      expect(readDir).toHaveBeenCalledTimes(4);
      expect(readDir).toHaveBeenLastCalledWith('input\\backend\\api');
      expect(execute).toHaveBeenCalledTimes(3);
      expect(execute).toHaveBeenLastCalledWith('npm exec -- tsc -p input --rootDir input --outDir input\\node_modules\\.tmp\\glc', 'input');
    }
    else {
      expect(spawn).toHaveBeenCalledTimes(4);
      expect(spawn).toHaveBeenLastCalledWith('sh', ['-c', `kill -9 1234`]);
      expect(remove).toHaveBeenCalledTimes(4);
      expect(remove).toHaveBeenLastCalledWith('input/node_modules/.tmp/glc');
      expect(readDir).toHaveBeenCalledTimes(4);
      expect(readDir).toHaveBeenLastCalledWith('input/backend/api');
      expect(execute).toHaveBeenCalledTimes(3);
      expect(execute).toHaveBeenLastCalledWith('npm exec -- tsc -p input --rootDir input --outDir input/node_modules/.tmp/glc', 'input');
    }
  });

  it('validate compiling the API', () => {
    const makeDir = vi.spyOn(sysUtilsSrc, 'makeDir').mockImplementation(() => {/*Emtpy*/});
    const makeFile = vi.spyOn(sysUtilsSrc, 'makeFile').mockImplementation(() => {/*Emtpy*/});

    compile({ name: 'pkg' }, { name: 'cfg' }, 'input', 'output');
    if ('win32' === process.platform) {
      expect(makeDir).toHaveBeenCalledTimes(1);
      expect(makeDir).toHaveBeenLastCalledWith('output\\etc\\cron.d');
      expect(makeFile).toHaveBeenCalledTimes(1);
      expect(makeFile).toHaveBeenLastCalledWith('output\\etc\\cron.d\\cfg_api', '@reboot root node /opt/cfg/node_modules/glidelite/lib/apiserver/run.js >> /var/log/cfg/api.log &\n* * * * * root ps aux | grep -v grep | grep -c "node /opt/cfg/node_modules/glidelite/lib/apiserver/run.js" || node /opt/cfg/node_modules/glidelite/lib/apiserver/run.js >> /var/log/cfg/api.log &\n');
    }
    else {
      expect(makeDir).toHaveBeenCalledTimes(1);
      expect(makeDir).toHaveBeenLastCalledWith('output/etc/cron.d');
      expect(makeFile).toHaveBeenCalledTimes(1);
      expect(makeFile).toHaveBeenLastCalledWith('output/etc/cron.d/cfg_api', '@reboot root node /opt/cfg/node_modules/glidelite/lib/apiserver/run.js >> /var/log/cfg/api.log &\n* * * * * root ps aux | grep -v grep | grep -c "node /opt/cfg/node_modules/glidelite/lib/apiserver/run.js" || node /opt/cfg/node_modules/glidelite/lib/apiserver/run.js >> /var/log/cfg/api.log &\n');
    }
  });
});
