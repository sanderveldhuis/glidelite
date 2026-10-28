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
  copyFile,
  execute,
  exists,
  makeDir,
  makeFile,
  readDir,
  readFile,
  readJsonFile,
  remove
} from '../../src/compiler/sysUtils';

vi.mock('node:fs');
vi.mock('node:child_process');

describe('sysUtils.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validate checking if a file or directory exists', () => {
    const existsSync = vi.spyOn(fs, 'existsSync');

    existsSync.mockReturnValueOnce(true);
    const result1 = exists('test');
    expect(result1).to.equal(true);
    expect(existsSync).toHaveBeenCalledTimes(1);
    expect(existsSync).toHaveBeenLastCalledWith('test');

    existsSync.mockReturnValueOnce(false);
    const result2 = exists('test');
    expect(result2).to.equal(false);
    expect(existsSync).toHaveBeenCalledTimes(2);
    expect(existsSync).toHaveBeenLastCalledWith('test');
  });

  it('validate removing a file or directory', () => {
    const rmSync = vi.spyOn(fs, 'rmSync').mockImplementation(() => {/*Emtpy*/});
    remove('test');
    expect(rmSync).toHaveBeenCalledTimes(1);
    expect(rmSync).toHaveBeenLastCalledWith('test', { recursive: true, force: true });
  });

  it('validate creating a directory', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const mkdirSync = vi.spyOn(fs, 'mkdirSync').mockImplementation((): undefined => {/*Emtpy*/});

    makeDir('test');
    expect(mkdirSync).toHaveBeenCalledTimes(1);
    expect(mkdirSync).toHaveBeenLastCalledWith('test', { recursive: true });

    mkdirSync.mockThrowOnce(new Error('unknown'));
    makeDir('test');
    expect(mkdirSync).toHaveBeenCalledTimes(2);
    expect(mkdirSync).toHaveBeenLastCalledWith('test', { recursive: true });
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2001:', "Failed creating directory at: 'test', unknown.");
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(2001);

    mkdirSync.mockThrowOnce(new Number());
    makeDir('test');
    expect(mkdirSync).toHaveBeenCalledTimes(3);
    expect(mkdirSync).toHaveBeenLastCalledWith('test', { recursive: true });
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2001:', "Failed creating directory at: 'test'.");
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(2001);
  });

  it('validate creating a file', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const writeFileSync = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {/*Emtpy*/});

    makeFile('test', 'content');
    expect(writeFileSync).toHaveBeenCalledTimes(1);
    expect(writeFileSync).toHaveBeenLastCalledWith('test', 'content');

    writeFileSync.mockThrowOnce(new Error('unknown'));
    makeFile('test', 'content');
    expect(writeFileSync).toHaveBeenCalledTimes(2);
    expect(writeFileSync).toHaveBeenLastCalledWith('test', 'content');
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2011:', "Failed creating file at: 'test', unknown.");
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(2011);

    writeFileSync.mockThrowOnce(new Number());
    makeFile('test', 'content');
    expect(writeFileSync).toHaveBeenCalledTimes(3);
    expect(writeFileSync).toHaveBeenLastCalledWith('test', 'content');
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2011:', "Failed creating file at: 'test'.");
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(2011);
  });

  it('validate copying a file', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const copyFileSync = vi.spyOn(fs, 'copyFileSync').mockImplementation(() => {/*Emtpy*/});

    copyFile('source', 'dest');
    expect(copyFileSync).toHaveBeenCalledTimes(1);
    expect(copyFileSync).toHaveBeenLastCalledWith('source', 'dest');

    copyFileSync.mockThrowOnce(new Error('unknown'));
    copyFile('source', 'dest');
    expect(copyFileSync).toHaveBeenCalledTimes(2);
    expect(copyFileSync).toHaveBeenLastCalledWith('source', 'dest');
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2013:', "Failed copying file from: 'source', to: 'dest', unknown.");
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(2013);

    copyFileSync.mockThrowOnce(new Number());
    copyFile('source', 'dest');
    expect(copyFileSync).toHaveBeenCalledTimes(3);
    expect(copyFileSync).toHaveBeenLastCalledWith('source', 'dest');
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2013:', "Failed copying file from: 'source', to: 'dest'.");
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(2013);
  });

  it('validate reading a directory', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const readdirSync = vi.spyOn(fs, 'readdirSync');

    readdirSync.mockReturnValueOnce([]);
    const result = readDir('test');
    expect(readdirSync).toHaveBeenCalledTimes(1);
    expect(readdirSync).toHaveBeenLastCalledWith('test', { withFileTypes: true, recursive: true });
    expect(result.length).to.equal(0);

    readdirSync.mockThrowOnce(new Error('unknown'));
    readDir('test');
    expect(readdirSync).toHaveBeenCalledTimes(2);
    expect(readdirSync).toHaveBeenLastCalledWith('test', { withFileTypes: true, recursive: true });
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2002:', "Failed reading directory at: 'test', unknown.");
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(2002);

    readdirSync.mockThrowOnce(new Number());
    readDir('test');
    expect(readdirSync).toHaveBeenCalledTimes(3);
    expect(readdirSync).toHaveBeenLastCalledWith('test', { withFileTypes: true, recursive: true });
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2002:', "Failed reading directory at: 'test'.");
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(2002);
  });

  it('validate reading a file', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const readFileSync = vi.spyOn(fs, 'readFileSync');

    readFileSync.mockReturnValueOnce(Buffer.from('content'));
    const result = readFile('test');
    expect(readFileSync).toHaveBeenCalledTimes(1);
    expect(readFileSync).toHaveBeenLastCalledWith('test');
    expect(result).to.equal('content');

    readFileSync.mockThrowOnce(new Error('unknown'));
    readFile('test');
    expect(readFileSync).toHaveBeenCalledTimes(2);
    expect(readFileSync).toHaveBeenLastCalledWith('test');
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2012:', "Failed reading file at: 'test', unknown.");
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(2012);

    readFileSync.mockThrowOnce(new Number());
    readFile('test');
    expect(readFileSync).toHaveBeenCalledTimes(3);
    expect(readFileSync).toHaveBeenLastCalledWith('test');
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2012:', "Failed reading file at: 'test'.");
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(2012);
  });

  it('validate reading a JSON file', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const readFileSync = vi.spyOn(fs, 'readFileSync');

    readFileSync.mockReturnValueOnce(Buffer.from('{"hello":"world"}'));
    const result = readJsonFile('test');
    expect(readFileSync).toHaveBeenCalledTimes(1);
    expect(readFileSync).toHaveBeenLastCalledWith('test');
    expect(result).to.deep.equal({ hello: 'world' });

    readFileSync.mockReturnValueOnce(Buffer.from('invalid-json'));
    readJsonFile('test');
    expect(readFileSync).toHaveBeenCalledTimes(2);
    expect(readFileSync).toHaveBeenLastCalledWith('test');
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2012:', "Failed reading JSON at: 'test', Unexpected token 'i', \"invalid-json\" is not valid JSON.");
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(2012);

    readFileSync.mockThrowOnce(new Error('unknown'));
    readJsonFile('test');
    expect(readFileSync).toHaveBeenCalledTimes(3);
    expect(readFileSync).toHaveBeenLastCalledWith('test');
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2012:', "Failed reading JSON at: 'test', unknown.");
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(2012);

    readFileSync.mockThrowOnce(new Number());
    readJsonFile('test');
    expect(readFileSync).toHaveBeenCalledTimes(4);
    expect(readFileSync).toHaveBeenLastCalledWith('test');
    expect(consoleError).toHaveBeenCalledTimes(3);
    expect(consoleError).toHaveBeenLastCalledWith('error GL2012:', "Failed reading JSON at: 'test'.");
    expect(processExit).toHaveBeenCalledTimes(3);
    expect(processExit).toHaveBeenLastCalledWith(2012);
  });

  it('validate executing a command', () => {
    const execSync = vi.spyOn(child_process, 'execSync').mockImplementation(() => {
      return '';
    });

    let result = execute('test', 'path');
    expect(execSync).toHaveBeenCalledTimes(1);
    expect(execSync).toHaveBeenLastCalledWith('test', { cwd: 'path', stdio: 'inherit' });
    expect(result).to.equal(true);

    execSync.mockThrowOnce(new Error('unknown'));
    result = execute('test', 'path');
    expect(execSync).toHaveBeenCalledTimes(2);
    expect(execSync).toHaveBeenLastCalledWith('test', { cwd: 'path', stdio: 'inherit' });
    expect(result).to.equal(false);
  });
});
