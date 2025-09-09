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

    sinon.assert.calledWith(versionStub);
    sinon.assert.calledWith(processStub, 0);
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

    sinon.assert.calledWith(helpStub);
    sinon.assert.calledWith(processStub, 0);
  });

  it('validate when the init option is given', () => {
    const options: CommandOptions = { init: true };
    const paths: string[] = [];
    const command: Command = { options, paths };

    const initStub1 = sinon.stub(initProject, 'initProject');
    const processStub1 = sinon.stub(process, 'exit');
    handleCommandLine(command);
    initStub1.restore();
    processStub1.restore();

    sinon.assert.calledWith(initStub1, process.cwd());
    sinon.assert.calledWith(processStub1, 0);

    paths[0] = '.';
    const initStub2 = sinon.stub(initProject, 'initProject');
    const processStub2 = sinon.stub(process, 'exit');
    handleCommandLine(command);
    initStub2.restore();
    processStub2.restore();

    sinon.assert.calledWith(initStub2, '.');
    sinon.assert.calledWith(processStub2, 0);

    paths[0] = 'hello/.././world';
    const initStub3 = sinon.stub(initProject, 'initProject');
    const processStub3 = sinon.stub(process, 'exit');
    handleCommandLine(command);
    initStub3.restore();
    processStub3.restore();

    sinon.assert.calledWith(initStub3, 'world');
    sinon.assert.calledWith(processStub3, 0);

    paths[0] = '/tmp/hello/../world/./universe';
    const initStub4 = sinon.stub(initProject, 'initProject');
    const processStub4 = sinon.stub(process, 'exit');
    handleCommandLine(command);
    initStub4.restore();
    processStub4.restore();

    if ('win32' === process.platform) {
      sinon.assert.calledWith(initStub4, '\\tmp\\world\\universe');
    }
    else {
      sinon.assert.calledWith(initStub4, '/tmp/world/universe');
    }
    sinon.assert.calledWith(processStub4, 0);

    paths[1] = 'hello/../world';
    const initStub5 = sinon.stub(initProject, 'initProject');
    const processStub5 = sinon.stub(process, 'exit');
    handleCommandLine(command);
    initStub5.restore();
    processStub5.restore();

    if ('win32' === process.platform) {
      sinon.assert.calledWith(initStub5, '\\tmp\\world\\universe');
    }
    else {
      sinon.assert.calledWith(initStub5, '/tmp/world/universe');
    }
    sinon.assert.calledWith(processStub5, 0);
  });

  it('validate when no options are given', () => {
    const options = {} as CommandOptions;
    const paths: string[] = [];
    const command: Command = { options, paths };

    const processStub = sinon.stub(process, 'exit');
    handleCommandLine(command);
    processStub.restore();

    sinon.assert.calledWith(processStub, 0);
  });
});
