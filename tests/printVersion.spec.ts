import 'mocha';
import { assert } from 'chai';
import sinon from 'ts-sinon';
import { printVersion } from '../src/printVersion';
import { version } from '../src/version';

describe('printVersion.ts', () => {
  it('validate printing the version', () => {
    const stub = sinon.stub(console, 'log');
    printVersion();
    stub.restore();

    assert(stub.calledWith('Version', version));
  });
});
