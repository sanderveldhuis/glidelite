import 'mocha';
import sinon from 'ts-sinon';
import { printHelp } from '../src/compiler/printHelp';
import { version } from '../src/compiler/version';

describe('printHelp.ts', () => {
  let consoleLog: sinon.SinonStub;

  beforeEach(() => {
    consoleLog = sinon.stub(console, 'log');
  });

  afterEach(() => {
    consoleLog.restore();
  });

  it('validate printing the help', () => {
    printHelp();

    // We are only validating the important output
    sinon.assert.calledWith(consoleLog, 'glc: The GlideLite Compiler - Version', version, '\n');
    sinon.assert.calledWith(consoleLog, '     --help, -h  Print this message.\n');
    sinon.assert.calledWith(consoleLog, "  --version, -v  Print the compiler's version.\n");
  });
});
