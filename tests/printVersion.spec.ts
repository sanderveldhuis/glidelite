import 'mocha';
import sinon from 'ts-sinon';
import { printVersion } from '../src/printVersion';
import { version } from '../src/version';

describe('printVersion.ts', () => {
  let consoleLog: sinon.SinonStub;

  beforeEach(() => {
    consoleLog = sinon.stub(console, 'log');
  });

  afterEach(() => {
    consoleLog.restore();
  });

  it('validate printing the version', () => {
    printVersion();

    sinon.assert.calledOnceWithExactly(consoleLog, 'Version', version);
  });
});
