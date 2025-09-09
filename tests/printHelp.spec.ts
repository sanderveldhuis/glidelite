import 'mocha';
import sinon from 'ts-sinon';
import { printHelp } from '../src/printHelp';
import { version } from '../src/version';

describe('printHelp.ts', () => {
  it('validate printing the help', () => {
    const stub = sinon.stub(console, 'log');
    printHelp();
    stub.restore();

    // We are only validating the important output
    sinon.assert.calledWith(stub, 'glc: The GlideLite Compiler - Version', version, '\n');
    sinon.assert.calledWith(stub, '     --help, -h  Print this message.\n');
    sinon.assert.calledWith(stub, "  --version, -v  Print the compiler's version.\n");
  });
});
