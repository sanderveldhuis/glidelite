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
  let compileProject: sinon.SinonStub;
  let compileWorkers: sinon.SinonStub;
  let initProject: sinon.SinonStub;
  let printVersion: sinon.SinonStub;
  let printHelp: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    processExit = sinon.stub(process, 'exit');
    compileProject = sinon.stub(compileProjectSrc, 'compileProject');
    compileWorkers = sinon.stub(compileWorkersSrc, 'compileWorkers');
    initProject = sinon.stub(initProjectSrc, 'initProject');
    printVersion = sinon.stub(printVersionSrc, 'printVersion');
    printHelp = sinon.stub(printHelpSrc, 'printHelp');
  });

  afterEach(() => {
    consoleError.restore();
    processExit.restore();
    compileProject.restore();
    compileWorkers.restore();
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

  it('validate when the module option is given', () => {
    const options: CommandOptions = { module: 'workers' };
    const paths: string[] = [];
    const command: Command = { options, paths };

    handleCommandLine(command);

    sinon.assert.calledOnceWithExactly(compileWorkers, process.cwd());
    sinon.assert.calledWithExactly(processExit.getCall(0), 0);

    options.module = 'other';
    handleCommandLine(command);

    sinon.assert.calledOnceWithExactly(consoleError, 'error GL1003:', "Compiler for module 'other' not implemented.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 1003);
  });

  it('validate when no options are given', () => {
    const options = {} as CommandOptions;
    const paths: string[] = [];
    const command: Command = { options, paths };

    handleCommandLine(command);

    sinon.assert.calledOnceWithExactly(compileProject, process.cwd());
    sinon.assert.calledOnceWithExactly(processExit, 0);
  });
});
