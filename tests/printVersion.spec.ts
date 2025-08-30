import 'mocha';
import sinon from 'ts-sinon';
import { assert } from 'chai';
import { printVersion } from '../src/printVersion';
import { version } from '../src/version';

describe('printVersion.ts', () => {
  it('validate printing the version', () => {
    const spy = sinon.spy(console, 'log');

    printVersion();
    assert(spy.calledWith('Version', version));

    spy.restore();
  });
});
