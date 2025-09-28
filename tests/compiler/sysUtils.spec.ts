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

import { expect } from 'chai';
import * as child_process from 'node:child_process';
import * as fs from 'node:fs';
import sinon from 'ts-sinon';
import {
  execute,
  exists,
  makeDir,
  makeFile,
  readDir,
  readFile,
  readJsonFile,
  remove
} from '../../src/compiler/sysUtils';

describe('sysUtils.ts', () => {
  let consoleError: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let existsSync: sinon.SinonStub;
  let mkdirSync: sinon.SinonStub;
  let rmSync: sinon.SinonStub;
  let readdirSync: sinon.SinonStub;
  let readFileSync: sinon.SinonStub;
  let writeFileSync: sinon.SinonStub;
  let execSync: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    processExit = sinon.stub(process, 'exit');
    existsSync = sinon.stub(fs, 'existsSync');
    mkdirSync = sinon.stub(fs, 'mkdirSync');
    rmSync = sinon.stub(fs, 'rmSync');
    readdirSync = sinon.stub(fs, 'readdirSync');
    readFileSync = sinon.stub(fs, 'readFileSync');
    writeFileSync = sinon.stub(fs, 'writeFileSync');
    execSync = sinon.stub(child_process, 'execSync');
  });

  afterEach(() => {
    consoleError.restore();
    processExit.restore();
    existsSync.restore();
    mkdirSync.restore();
    rmSync.restore();
    readdirSync.restore();
    readFileSync.restore();
    writeFileSync.restore();
    execSync.restore();
  });

  it('validate checking if a file or directory exists', () => {
    existsSync.returns(true);

    const result = exists('test');

    expect(result).to.equal(true);
    sinon.assert.calledOnceWithExactly(existsSync, 'test');
  });

  it('validate removing a file or directory', () => {
    remove('test');

    sinon.assert.calledOnceWithExactly(rmSync, 'test', { recursive: true, force: true });
  });

  it('validate creating a directory', () => {
    makeDir('test');

    sinon.assert.calledWithExactly(mkdirSync.getCall(0), 'test', { recursive: true });

    mkdirSync.throws(new Error('unknown'));
    makeDir('test');

    sinon.assert.calledWithExactly(mkdirSync.getCall(1), 'test', { recursive: true });
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2001:', "Failed creating directory at: 'test', unknown.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 2001);

    mkdirSync.throws(new Number());
    makeDir('test');

    sinon.assert.calledWithExactly(mkdirSync.getCall(2), 'test', { recursive: true });
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2001:', "Failed creating directory at: 'test'.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 2001);
  });

  it('validate creating a file', () => {
    makeFile('test', 'content');

    sinon.assert.calledWithExactly(writeFileSync.getCall(0), 'test', 'content');

    writeFileSync.throws(new Error('unknown'));
    makeFile('test', 'content');

    sinon.assert.calledWithExactly(writeFileSync.getCall(1), 'test', 'content');
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2011:', "Failed creating file at: 'test', unknown.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 2011);

    writeFileSync.throws(new Number());
    makeFile('test', 'content');

    sinon.assert.calledWithExactly(writeFileSync.getCall(2), 'test', 'content');
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2011:', "Failed creating file at: 'test'.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 2011);
  });

  it('validate reading a directory', () => {
    readdirSync.returns([]);
    const result = readDir('test');

    expect(result.length).to.equal(0);
    sinon.assert.calledWithExactly(readdirSync.getCall(0), 'test', { withFileTypes: true, recursive: true });

    readdirSync.throws(new Error('unknown'));
    readDir('test');

    sinon.assert.calledWithExactly(readdirSync.getCall(1), 'test', { withFileTypes: true, recursive: true });
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2002:', "Failed reading directory at: 'test', unknown.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 2002);

    readdirSync.throws(new Number());
    readDir('test');

    sinon.assert.calledWithExactly(readdirSync.getCall(2), 'test', { withFileTypes: true, recursive: true });
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2002:', "Failed reading directory at: 'test'.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 2002);
  });

  it('validate reading a file', () => {
    const data = {
      toString: () => {
        return 'content';
      }
    };

    readFileSync.returns(data);
    const result = readFile('test');

    expect(result).to.equal('content');
    sinon.assert.calledWithExactly(readFileSync.getCall(0), 'test');

    readFileSync.throws(new Error('unknown'));
    readFile('test');

    sinon.assert.calledWithExactly(readFileSync.getCall(1), 'test');
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2012:', "Failed reading file at: 'test', unknown.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 2012);

    readFileSync.throws(new Number());
    readFile('test');

    sinon.assert.calledWithExactly(readFileSync.getCall(2), 'test');
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2012:', "Failed reading file at: 'test'.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 2012);
  });

  it('validate reading a JSON file', () => {
    let content = '{"hello":"world"}';
    const data = {
      toString: () => {
        return content;
      }
    };

    readFileSync.returns(data);
    const result = readJsonFile('test');

    expect(result).to.deep.equal({ hello: 'world' });
    sinon.assert.calledWithExactly(readFileSync.getCall(0), 'test');

    content = 'invalid-json';
    readFileSync.returns(data);
    readJsonFile('test');

    sinon.assert.calledWithExactly(readFileSync.getCall(1), 'test');
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2012:', "Failed reading JSON at: 'test', Unexpected token 'i', \"invalid-json\" is not valid JSON.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 2012);

    readFileSync.throws(new Error('unknown'));
    readJsonFile('test');

    sinon.assert.calledWithExactly(readFileSync.getCall(2), 'test');
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2012:', "Failed reading JSON at: 'test', unknown.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 2012);

    readFileSync.throws(new Number());
    readJsonFile('test');

    sinon.assert.calledWithExactly(readFileSync.getCall(3), 'test');
    sinon.assert.calledWithExactly(consoleError.getCall(2), 'error GL2012:', "Failed reading JSON at: 'test'.");
    sinon.assert.calledWithExactly(processExit.getCall(2), 2012);
  });

  it('validate executing a command', () => {
    execute('test', 'path');

    sinon.assert.calledWithExactly(execSync.getCall(0), 'test', { cwd: 'path', stdio: 'inherit' });

    execSync.throws(new Error('unknown'));
    execute('test', 'path');

    sinon.assert.calledWithExactly(execSync.getCall(1), 'test', { cwd: 'path', stdio: 'inherit' });
    sinon.assert.calledWithExactly(processExit.getCall(0), 3002);
  });
});
