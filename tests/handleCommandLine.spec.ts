import 'mocha';
import sinon from 'ts-sinon';
import * as compileProjectSrc from '../src/compileProject';
import * as compileWorkersSrc from '../src/compileWorkers';
import { handleCommandLine } from '../src/handleCommandLine';
import * as initProjectSrc from '../src/initProject';
import * as printHelpSrc from '../src/printHelp';
import * as printVersionSrc from '../src/printVersion';
import {
  Command,
  CommandOptions
} from '../src/types';

describe('handleCommandLine.ts', () => {
  let consoleError: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let cleanProject: sinon.SinonStub;
  let compileProject: sinon.SinonStub;
  let validateProject: sinon.SinonStub;
  let cleanWorkers: sinon.SinonStub;
  let compileWorkers: sinon.SinonStub;
  let validateWorkers: sinon.SinonStub;
  let initProject: sinon.SinonStub;
  let printVersion: sinon.SinonStub;
  let printHelp: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    processExit = sinon.stub(process, 'exit');
    cleanProject = sinon.stub(compileProjectSrc, 'clean');
    compileProject = sinon.stub(compileProjectSrc, 'compile');
    validateProject = sinon.stub(compileProjectSrc, 'validate');
    cleanWorkers = sinon.stub(compileWorkersSrc, 'clean');
    compileWorkers = sinon.stub(compileWorkersSrc, 'compile');
    validateWorkers = sinon.stub(compileWorkersSrc, 'validate');
    initProject = sinon.stub(initProjectSrc, 'initProject');
    printVersion = sinon.stub(printVersionSrc, 'printVersion');
    printHelp = sinon.stub(printHelpSrc, 'printHelp');
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
    initProject.restore();
    printVersion.restore();
    printHelp.restore();
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

    handleCommandLine(command);

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(compileWorkers.getCall(0), process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(compileWorkers.getCall(0), process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateWorkers.getCall(0), process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(0), 0);

    options.clean = false;
    handleCommandLine(command);

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(compileWorkers.getCall(1), process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(compileWorkers.getCall(1), process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateWorkers.getCall(1), process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(1), 0);

    options.clean = true;
    handleCommandLine(command);

    if ('win32' === process.platform) {
      sinon.assert.calledOnceWithExactly(cleanWorkers, process.cwd() + '\\output');
      sinon.assert.calledWithExactly(compileWorkers.getCall(2), process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledOnceWithExactly(cleanWorkers, process.cwd() + '/output');
      sinon.assert.calledWithExactly(compileWorkers.getCall(2), process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateWorkers.getCall(2), process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(2), 0);

    options.clean = false;
    options.outdir = 'hello/../world';
    handleCommandLine(command);

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(compileWorkers.getCall(3), process.cwd(), process.cwd() + '\\world');
    }
    else {
      sinon.assert.calledWithExactly(compileWorkers.getCall(3), process.cwd(), process.cwd() + '/world');
    }
    sinon.assert.calledWithExactly(validateWorkers.getCall(3), process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(3), 0);
  });

  it('validate when no options are given', () => {
    const options = {} as CommandOptions;
    const paths: string[] = [];
    const command: Command = { options, paths };

    handleCommandLine(command);

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(compileProject.getCall(0), process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(compileProject.getCall(0), process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateProject.getCall(0), process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(0), 0);

    options.clean = false;
    handleCommandLine(command);

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(compileProject.getCall(1), process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledWithExactly(compileProject.getCall(1), process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateProject.getCall(1), process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(1), 0);

    options.clean = true;
    handleCommandLine(command);

    if ('win32' === process.platform) {
      sinon.assert.calledOnceWithExactly(cleanProject, process.cwd() + '\\output');
      sinon.assert.calledWithExactly(compileProject.getCall(2), process.cwd(), process.cwd() + '\\output');
    }
    else {
      sinon.assert.calledOnceWithExactly(cleanProject, process.cwd() + '/output');
      sinon.assert.calledWithExactly(compileProject.getCall(2), process.cwd(), process.cwd() + '/output');
    }
    sinon.assert.calledWithExactly(validateProject.getCall(2), process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(2), 0);

    options.clean = false;
    options.outdir = 'hello/../world';
    handleCommandLine(command);

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(compileProject.getCall(3), process.cwd(), process.cwd() + '\\world');
    }
    else {
      sinon.assert.calledWithExactly(compileProject.getCall(3), process.cwd(), process.cwd() + '/world');
    }
    sinon.assert.calledWithExactly(validateProject.getCall(3), process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(3), 0);
  });
});
