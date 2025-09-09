import 'mocha';
import { assert } from 'chai';
import sinon from 'ts-sinon';
import { handleCommandLine } from '../src/handleCommandLine';
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

    assert(versionStub.calledWith());
    assert(processStub.calledWith(0));
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

    assert(helpStub.calledWith());
    assert(processStub.calledWith(0));
  });

  it('validate when no options are given', () => {
    const options = {} as CommandOptions;
    const paths: string[] = [];
    const command: Command = { options, paths };

    const processStub = sinon.stub(process, 'exit');
    handleCommandLine(command);
    processStub.restore();

    assert(processStub.calledWith(0));
  });
});
