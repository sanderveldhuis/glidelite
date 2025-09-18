import 'mocha';
import * as fs from 'node:fs';
import sinon from 'ts-sinon';
import { initProject } from '../../src/compiler/initProject';
import * as sysUtils from '../../src/compiler/sysUtils';

describe('initProject.ts', () => {
  let consoleError: sinon.SinonStub;
  let consoleLog: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let existsSync: sinon.SinonStub;
  let makeDir: sinon.SinonStub;
  let makeFile: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    consoleLog = sinon.stub(console, 'log');
    processExit = sinon.stub(process, 'exit');
    existsSync = sinon.stub(fs, 'existsSync');
    makeDir = sinon.stub(sysUtils, 'makeDir');
    makeFile = sinon.stub(sysUtils, 'makeFile');
  });

  afterEach(() => {
    consoleError.restore();
    consoleLog.restore();
    processExit.restore();
    existsSync.restore();
    makeDir.restore();
    makeFile.restore();
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

  it('validate when the project is initialized', () => {
    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(makeDir.getCall(0), 'test\\backend\\workers');
      sinon.assert.calledWithExactly(makeFile.getCall(0), 'test\\glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(makeFile.getCall(1), 'test\\backend\\workers\\tsconfig.json', '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
    }
    else {
      sinon.assert.calledWithExactly(existsSync.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(existsSync.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(makeDir.getCall(0), 'test/backend/workers');
      sinon.assert.calledWithExactly(makeFile.getCall(0), 'test/glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(makeFile.getCall(1), 'test/backend/workers/tsconfig.json', '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
    }
    sinon.assert.calledOnceWithExactly(consoleLog, "Created a new GlideLite project at: 'test'.");
  });
});
