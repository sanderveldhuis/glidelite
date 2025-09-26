import 'mocha';
import { expect } from 'chai';
import * as child_process from 'node:child_process';
import * as fs from 'node:fs';
import sinon from 'ts-sinon';
import {
  execute,
  makeDir,
  makeFile,
  readFile,
  readJsonFile,
  remove
} from '../../src/compiler/sysUtils';

describe('sysUtils.ts', () => {
  let consoleError: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let mkdirSync: sinon.SinonStub;
  let rmSync: sinon.SinonStub;
  let readFileSync: sinon.SinonStub;
  let writeFileSync: sinon.SinonStub;
  let execSync: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    processExit = sinon.stub(process, 'exit');
    mkdirSync = sinon.stub(fs, 'mkdirSync');
    rmSync = sinon.stub(fs, 'rmSync');
    readFileSync = sinon.stub(fs, 'readFileSync');
    writeFileSync = sinon.stub(fs, 'writeFileSync');
    execSync = sinon.stub(child_process, 'execSync');
  });

  afterEach(() => {
    consoleError.restore();
    processExit.restore();
    mkdirSync.restore();
    rmSync.restore();
    readFileSync.restore();
    writeFileSync.restore();
    execSync.restore();
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
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2003:', "Failed creating file at: 'test', unknown.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 2003);

    writeFileSync.throws(new Number());
    makeFile('test', 'content');

    sinon.assert.calledWithExactly(writeFileSync.getCall(2), 'test', 'content');
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2003:', "Failed creating file at: 'test'.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 2003);
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
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2004:', "Failed reading file at: 'test', unknown.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 2004);

    readFileSync.throws(new Number());
    readFile('test');

    sinon.assert.calledWithExactly(readFileSync.getCall(2), 'test');
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2004:', "Failed reading file at: 'test'.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 2004);
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
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2004:', "Failed reading file at: 'test', Unexpected token 'i', \"invalid-json\" is not valid JSON.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 2004);

    readFileSync.throws(new Error('unknown'));
    readJsonFile('test');

    sinon.assert.calledWithExactly(readFileSync.getCall(2), 'test');
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2004:', "Failed reading file at: 'test', unknown.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 2004);

    readFileSync.throws(new Number());
    readJsonFile('test');

    sinon.assert.calledWithExactly(readFileSync.getCall(3), 'test');
    sinon.assert.calledWithExactly(consoleError.getCall(2), 'error GL2004:', "Failed reading file at: 'test'.");
    sinon.assert.calledWithExactly(processExit.getCall(2), 2004);
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
