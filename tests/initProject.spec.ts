import 'mocha';
import * as fs from 'node:fs';
import sinon from 'ts-sinon';
import { initProject } from '../src/initProject';

describe('initProject.ts', () => {
  let consoleError: sinon.SinonStub;
  let consoleLog: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let existsSync: sinon.SinonStub;
  let mkdirSync: sinon.SinonStub;
  let writeFileSync: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    consoleLog = sinon.stub(console, 'log');
    processExit = sinon.stub(process, 'exit');
    existsSync = sinon.stub(fs, 'existsSync');
    mkdirSync = sinon.stub(fs, 'mkdirSync');
    writeFileSync = sinon.stub(fs, 'writeFileSync');
  });

  afterEach(() => {
    consoleError.restore();
    consoleLog.restore();
    processExit.restore();
    existsSync.restore();
    mkdirSync.restore();
    writeFileSync.restore();
  });

  it('validate when the GlideLite config already exists', () => {
    existsSync.returns(true);

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledOnceWithExactly(existsSync, 'test\\glconfig.json');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2002:', "A 'glconfig.json' file already defined at: 'test\\glconfig.json'.");
    }
    else {
      sinon.assert.calledOnceWithExactly(existsSync, 'test/glconfig.json');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2002:', "A 'glconfig.json' file already defined at: 'test/glconfig.json'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 2002);
  });

  it('validate when the TypeScript config already exists', () => {
    existsSync.onCall(0).returns(false).onCall(1).returns(true);

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2002:', "A 'tsconfig.json' file already defined at: 'test\\backend\\workers\\tsconfig.json'.");
    }
    else {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2002:', "A 'tsconfig.json' file already defined at: 'test/backend/workers/tsconfig.json'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 2002);
  });

  it('validate when the workers directory cannot be created', () => {
    // mkdirSync returns error object
    mkdirSync.throws(new Error('unknown'));

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(0), 'test\\backend\\workers', { recursive: true });
      sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2001:', "Failed creating directory at: 'test\\backend\\workers', unknown.");
    }
    else {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(0), 'test/backend/workers', { recursive: true });
      sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2001:', "Failed creating directory at: 'test/backend/workers', unknown.");
    }
    sinon.assert.calledWithExactly(processExit.getCall(0), 2001);

    // mkdirSync returns non-error object
    mkdirSync.throws(new Number());

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(existsSync.getCall(2), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(3), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(1), 'test\\backend\\workers', { recursive: true });
      sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2001:', "Failed creating directory at: 'test\\backend\\workers'.");
    }
    else {
      sinon.assert.calledWithExactly(existsSync.getCall(2), 'test/glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(3), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(1), 'test/backend/workers', { recursive: true });
      sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2001:', "Failed creating directory at: 'test/backend/workers'.");
    }
    sinon.assert.calledWithExactly(processExit.getCall(1), 2001);
  });

  it('validate when the GlideLite config cannot be created', () => {
    // writeFileSync returns error object
    writeFileSync.throws(new Error('unknown'));

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(0), 'test\\backend\\workers', { recursive: true });
      sinon.assert.calledWithExactly(writeFileSync.getCall(0), 'test\\glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2003:', "Failed creating file at: 'test\\glconfig.json', unknown.");
    }
    else {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(0), 'test/backend/workers', { recursive: true });
      sinon.assert.calledWithExactly(writeFileSync.getCall(0), 'test/glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2003:', "Failed creating file at: 'test/glconfig.json', unknown.");
    }
    sinon.assert.calledWithExactly(processExit.getCall(0), 2003);

    // writeFileSync returns non-error object
    writeFileSync.throws(new Number());

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(existsSync.getCall(2), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(3), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(1), 'test\\backend\\workers', { recursive: true });
      sinon.assert.calledWithExactly(writeFileSync.getCall(1), 'test\\glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2003:', "Failed creating file at: 'test\\glconfig.json'.");
    }
    else {
      sinon.assert.calledWithExactly(existsSync.getCall(2), 'test/glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(3), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(1), 'test/backend/workers', { recursive: true });
      sinon.assert.calledWithExactly(writeFileSync.getCall(1), 'test/glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL2003:', "Failed creating file at: 'test/glconfig.json'.");
    }
    sinon.assert.calledWithExactly(processExit.getCall(1), 2003);
  });

  it('validate when the TypeScript config cannot be created', () => {
    writeFileSync.onCall(0).returns(true).onCall(1).throws(new Error('unknown'));

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(0), 'test\\backend\\workers', { recursive: true });
      sinon.assert.calledWithExactly(writeFileSync.getCall(0), 'test\\glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(writeFileSync.getCall(1), 'test\\backend\\workers\\tsconfig.json', '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
      sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2003:', "Failed creating file at: 'test\\backend\\workers\\tsconfig.json', unknown.");
    }
    else {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(0), 'test/backend/workers', { recursive: true });
      sinon.assert.calledWithExactly(writeFileSync.getCall(0), 'test/glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(writeFileSync.getCall(1), 'test/backend/workers/tsconfig.json', '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
      sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL2003:', "Failed creating file at: 'test/backend/workers/tsconfig.json', unknown.");
    }
    sinon.assert.calledWithExactly(processExit.getCall(0), 2003);
  });

  it('validate when the project is initialized', () => {
    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(0), 'test\\backend\\workers', { recursive: true });
      sinon.assert.calledWithExactly(writeFileSync.getCall(0), 'test\\glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(writeFileSync.getCall(1), 'test\\backend\\workers\\tsconfig.json', '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
    }
    else {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(mkdirSync.getCall(0), 'test/backend/workers', { recursive: true });
      sinon.assert.calledWithExactly(writeFileSync.getCall(0), 'test/glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(writeFileSync.getCall(1), 'test/backend/workers/tsconfig.json', '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
    }
    sinon.assert.calledOnceWithExactly(consoleLog, "Created a new GlideLite project at: 'test'.");
  });
});
