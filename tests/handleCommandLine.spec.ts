import 'mocha';
import sinon from 'ts-sinon';
import { handleCommandLine } from '../src/handleCommandLine';
import * as initProject from '../src/initProject';
import * as printHelp from '../src/printHelp';
import * as printVersion from '../src/printVersion';
import {
  Command,
  CommandOptions
} from '../src/types';

describe('handleCommandLine.ts', () => {
  it('validate when the version option is given', () => {
    const options: CommandOptions = { version: true };
    const paths: string[] = [];
    const command: Command = { options, paths };

    const versionStub = sinon.stub(printVersion, 'printVersion');
    const processStub = sinon.stub(process, 'exit');
    handleCommandLine(command);
    versionStub.restore();
    processStub.restore();

    sinon.assert.calledOnceWithExactly(versionStub);
    sinon.assert.calledOnceWithExactly(processStub, 0);
  });

  it('validate when the help option is given', () => {
    const options: CommandOptions = { help: true };
    const paths: string[] = [];
    const command: Command = { options, paths };

    const helpStub = sinon.stub(printHelp, 'printHelp');
    const processStub = sinon.stub(process, 'exit');
    handleCommandLine(command);
    helpStub.restore();
    processStub.restore();

    sinon.assert.calledOnceWithExactly(helpStub);
    sinon.assert.calledOnceWithExactly(processStub, 0);
  });

  it('validate when the init option is given', () => {
    const options: CommandOptions = { init: true };
    const paths: string[] = [];
    const command: Command = { options, paths };

    const initStub = sinon.stub(initProject, 'initProject');
    const processStub = sinon.stub(process, 'exit');
    handleCommandLine(command);
    initStub.restore();
    processStub.restore();

    sinon.assert.calledOnceWithExactly(initStub, process.cwd());
    sinon.assert.calledOnceWithExactly(processStub, 0);
  });

  it('validate when no options are given', () => {
    const options = {} as CommandOptions;
    const paths: string[] = [];
    const command: Command = { options, paths };

    const processStub = sinon.stub(process, 'exit');
    handleCommandLine(command);
    processStub.restore();

    sinon.assert.calledOnceWithExactly(processStub, 0);
  });
});
