import 'mocha';
import { assert } from 'chai';
import sinon from 'ts-sinon';
import { printHelp } from '../src/printHelp';
import { version } from '../src/version';

describe('printHelp.ts', () => {
  it('validate printing the help', () => {
    const stub = sinon.stub(console, 'log');
    printHelp();
    stub.restore();

    // We are only validating the important output
    assert(stub.calledWith('glc: The GlideLite Compiler - Version', version, '\n'));
    assert(stub.calledWith('     --help, -h  Print this message.\n'));
    assert(stub.calledWith("  --version, -v  Print the compiler's version.\n"));
  });
});
