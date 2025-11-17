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
import * as compileFrontendSrc from '../../src/compiler/compileFrontend';
import * as compileProjectSrc from '../../src/compiler/compileProject';
import * as compileWorkersSrc from '../../src/compiler/compileWorkers';
import { handleCommandLine } from '../../src/compiler/handleCommandLine';
import * as initProjectSrc from '../../src/compiler/initProject';
import * as printHelpSrc from '../../src/compiler/printHelp';
import * as printVersionSrc from '../../src/compiler/printVersion';
import * as sysUtilsSrc from '../../src/compiler/sysUtils';
import {
  Command,
  CommandOptions
} from '../../src/compiler/types';

describe('handleCommandLine.ts', () => {
  let consoleError: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let cleanProject: sinon.SinonStub;
  let compileProject: sinon.SinonStub;
  let validateProject: sinon.SinonStub;
  let cleanWorkers: sinon.SinonStub;
  let compileWorkers: sinon.SinonStub;
  let validateWorkers: sinon.SinonStub;
  let cleanFrontend: sinon.SinonStub;
  let compileFrontend: sinon.SinonStub;
  let validateFrontend: sinon.SinonStub;
  let initProject: sinon.SinonStub;
  let printVersion: sinon.SinonStub;
  let printHelp: sinon.SinonStub;
  let readJsonFile: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    processExit = sinon.stub(process, 'exit');
    cleanProject = sinon.stub(compileProjectSrc, 'clean');
    compileProject = sinon.stub(compileProjectSrc, 'compile');
    validateProject = sinon.stub(compileProjectSrc, 'validate');
    cleanWorkers = sinon.stub(compileWorkersSrc, 'clean');
    compileWorkers = sinon.stub(compileWorkersSrc, 'compile');
    validateWorkers = sinon.stub(compileWorkersSrc, 'validate');
    cleanFrontend = sinon.stub(compileFrontendSrc, 'clean');
    compileFrontend = sinon.stub(compileFrontendSrc, 'compile');
    validateFrontend = sinon.stub(compileFrontendSrc, 'validate');
    initProject = sinon.stub(initProjectSrc, 'initProject');
    printVersion = sinon.stub(printVersionSrc, 'printVersion');
    printHelp = sinon.stub(printHelpSrc, 'printHelp');
    readJsonFile = sinon.stub(sysUtilsSrc, 'readJsonFile');
  });

  afterEach(() => {
    consoleError.restore();
    processExit.restore();
    cleanProject.restore();
    compileProject.restore();
    validateProject.restore();
    cleanWorkers.restore();
    compileWorkers.restore();
    validateWorkers.restore();
    cleanFrontend.restore();
    compileFrontend.restore();
    validateFrontend.restore();
    initProject.restore();
    printVersion.restore();
    printHelp.restore();
    readJsonFile.restore();
  });

  it('validate when the version option is given', () => {
    const options: CommandOptions = { version: true };
    const paths: string[] = [];
    const command: Command = { options, paths };
    handleCommandLine(command);
    sinon.assert.calledOnceWithExactly(printVersion);
    sinon.assert.calledOnceWithExactly(processExit, 0);
  });

  it('validate when the help option is given', () => {
    const options: CommandOptions = { help: true };
    const paths: string[] = [];
    const command: Command = { options, paths };
    handleCommandLine(command);
    sinon.assert.calledOnceWithExactly(printHelp);
    sinon.assert.calledOnceWithExactly(processExit, 0);
  });

  it('validate when the init option is given', () => {
    const options: CommandOptions = { init: true };
    const paths: string[] = [];
    const command: Command = { options, paths };
    handleCommandLine(command);
    sinon.assert.calledOnceWithExactly(initProject, process.cwd());
    sinon.assert.calledOnceWithExactly(processExit, 0);
  });

  it('validate when the module option is unknown', () => {
    const options: CommandOptions = { module: 'other' };
    const paths: string[] = [];
    const command: Command = { options, paths };
    handleCommandLine(command);
    sinon.assert.calledOnceWithExactly(consoleError, 'error GL1003:', "Compiler for module 'other' not implemented.");
    sinon.assert.calledOnceWithExactly(processExit, 1003);
  });

  it('validate when the workers module option is given', () => {
    const options: CommandOptions = { module: 'workers' };
    const paths: string[] = [];
    const command: Command = { options, paths };

    readJsonFile.onCall(0).returns({ name: 'pkg', version: '1.0.0' }).onCall(1).returns({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(0), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(1), process.cwd() + '\\glconfig.json');
      sinon.assert.calledWithExactly(compileWorkers.getCall(0), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(0), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(1), process.cwd() + '/glconfig.json');
      sinon.assert.calledWithExactly(compileWorkers.getCall(0), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateWorkers.getCall(0), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(0), 0);

    options.clean = false;
    readJsonFile.onCall(2).returns({ name: 'pkg', version: '1.0.0' }).onCall(3).returns({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(2), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(3), process.cwd() + '\\glconfig.json');
      sinon.assert.calledWithExactly(compileWorkers.getCall(1), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(2), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(3), process.cwd() + '/glconfig.json');
      sinon.assert.calledWithExactly(compileWorkers.getCall(1), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateWorkers.getCall(1), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(1), 0);

    options.clean = true;
    readJsonFile.onCall(4).returns({ name: 'pkg', version: '1.0.0' }).onCall(5).returns({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(4), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(5), process.cwd() + '\\glconfig.json');
      sinon.assert.calledOnceWithExactly(cleanWorkers, { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd() + '\\output');
      sinon.assert.calledWithExactly(compileWorkers.getCall(2), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(4), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(5), process.cwd() + '/glconfig.json');
      sinon.assert.calledOnceWithExactly(cleanWorkers, { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd() + '/output');
      sinon.assert.calledWithExactly(compileWorkers.getCall(2), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateWorkers.getCall(2), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(2), 0);

    options.clean = false;
    options.outdir = 'hello/../world';
    readJsonFile.onCall(6).returns({ name: 'pkg', version: '1.0.0' }).onCall(7).returns({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(6), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(7), process.cwd() + '\\glconfig.json');
      sinon.assert.calledWithExactly(compileWorkers.getCall(3), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\world');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(6), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(7), process.cwd() + '/glconfig.json');
      sinon.assert.calledWithExactly(compileWorkers.getCall(3), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/world');
    }
    sinon.assert.calledWithExactly(validateWorkers.getCall(3), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(3), 0);
  });

  it('validate when the frontend module option is given', () => {
    const options: CommandOptions = { module: 'frontend' };
    const paths: string[] = [];
    const command: Command = { options, paths };

    readJsonFile.onCall(0).returns({ name: 'pkg', version: '1.0.0' }).onCall(1).returns({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(0), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(1), process.cwd() + '\\glconfig.json');
      sinon.assert.calledWithExactly(compileFrontend.getCall(0), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(0), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(1), process.cwd() + '/glconfig.json');
      sinon.assert.calledWithExactly(compileFrontend.getCall(0), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateFrontend.getCall(0), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(0), 0);

    options.clean = false;
    readJsonFile.onCall(2).returns({ name: 'pkg', version: '1.0.0' }).onCall(3).returns({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(2), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(3), process.cwd() + '\\glconfig.json');
      sinon.assert.calledWithExactly(compileFrontend.getCall(1), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(2), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(3), process.cwd() + '/glconfig.json');
      sinon.assert.calledWithExactly(compileFrontend.getCall(1), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateFrontend.getCall(1), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(1), 0);

    options.clean = true;
    readJsonFile.onCall(4).returns({ name: 'pkg', version: '1.0.0' }).onCall(5).returns({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(4), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(5), process.cwd() + '\\glconfig.json');
      sinon.assert.calledOnceWithExactly(cleanFrontend, { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd() + '\\output');
      sinon.assert.calledWithExactly(compileFrontend.getCall(2), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(4), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(5), process.cwd() + '/glconfig.json');
      sinon.assert.calledOnceWithExactly(cleanFrontend, { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd() + '/output');
      sinon.assert.calledWithExactly(compileFrontend.getCall(2), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateFrontend.getCall(2), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(2), 0);

    options.clean = false;
    options.outdir = 'hello/../world';
    readJsonFile.onCall(6).returns({ name: 'pkg', version: '1.0.0' }).onCall(7).returns({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(6), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(7), process.cwd() + '\\glconfig.json');
      sinon.assert.calledWithExactly(compileFrontend.getCall(3), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\world');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(6), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(7), process.cwd() + '/glconfig.json');
      sinon.assert.calledWithExactly(compileFrontend.getCall(3), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/world');
    }
    sinon.assert.calledWithExactly(validateFrontend.getCall(3), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(3), 0);
  });

  it('validate when no options are given', () => {
    const options = {} as CommandOptions;
    const paths: string[] = [];
    const command: Command = { options, paths };

    readJsonFile.onCall(0).returns({ name: 'pkg', version: '1.0.0' }).onCall(1).returns({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(0), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(1), process.cwd() + '\\glconfig.json');
      sinon.assert.calledWithExactly(compileProject.getCall(0), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(0), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(1), process.cwd() + '/glconfig.json');
      sinon.assert.calledWithExactly(compileProject.getCall(0), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateProject.getCall(0), { name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(0), 0);

    options.clean = false;
    readJsonFile.onCall(2).returns({ name: 'pkg', version: '1.0.0', homepage: 'https://example1.com' }).onCall(3).returns({ name: 'cfg', homepage: 'https://example2.com' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(2), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(3), process.cwd() + '\\glconfig.json');
      sinon.assert.calledWithExactly(compileProject.getCall(1), { name: 'pkg', version: '1.0.0', homepage: 'https://example1.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example2.com' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(2), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(3), process.cwd() + '/glconfig.json');
      sinon.assert.calledWithExactly(compileProject.getCall(1), { name: 'pkg', version: '1.0.0', homepage: 'https://example1.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example2.com' }, process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateProject.getCall(1), { name: 'pkg', version: '1.0.0', homepage: 'https://example1.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example2.com' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(1), 0);

    options.clean = true;
    readJsonFile.onCall(4).returns({ name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }).onCall(5).returns({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(4), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(5), process.cwd() + '\\glconfig.json');
      sinon.assert.calledOnceWithExactly(cleanProject, { name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com' }, process.cwd() + '\\output');
      sinon.assert.calledWithExactly(compileProject.getCall(2), { name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(4), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(5), process.cwd() + '/glconfig.json');
      sinon.assert.calledOnceWithExactly(cleanProject, { name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com' }, process.cwd() + '/output');
      sinon.assert.calledWithExactly(compileProject.getCall(2), { name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com' }, process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateProject.getCall(2), { name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(2), 0);

    options.clean = false;
    options.outdir = 'hello/../world';
    readJsonFile.onCall(6).returns({ name: 'pkg', version: '1.0.0' }).onCall(7).returns({ version: '1.0.1', homepage: 'https://example.com' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(readJsonFile.getCall(6), process.cwd() + '\\package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(7), process.cwd() + '\\glconfig.json');
      sinon.assert.calledWithExactly(compileProject.getCall(3), { name: 'pkg', version: '1.0.0' }, { name: 'pkg', version: '1.0.1', homepage: 'https://example.com' }, process.cwd(), process.cwd() + '\\world');
    }
    else {
      sinon.assert.calledWithExactly(readJsonFile.getCall(6), process.cwd() + '/package.json');
      sinon.assert.calledWithExactly(readJsonFile.getCall(7), process.cwd() + '/glconfig.json');
      sinon.assert.calledWithExactly(compileProject.getCall(3), { name: 'pkg', version: '1.0.0' }, { name: 'pkg', version: '1.0.1', homepage: 'https://example.com' }, process.cwd(), process.cwd() + '/world');
    }
    sinon.assert.calledWithExactly(validateProject.getCall(3), { name: 'pkg', version: '1.0.0' }, { name: 'pkg', version: '1.0.1', homepage: 'https://example.com' }, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(3), 0);
  });
});
