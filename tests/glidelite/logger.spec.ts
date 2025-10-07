/**
 * MIT License
 *
 * Copyright (c) 2025 Sander Veldhuis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { expect } from 'chai';
import sinon from 'ts-sinon';
import {
  log,
  Logger
} from '../../src/glidelite/logger';

describe('logger.ts', () => {
  let consoleLog: sinon.SinonStub;
  let consoleError: sinon.SinonStub;

  beforeEach(() => {
    consoleLog = sinon.stub(console, 'log');
    consoleError = sinon.stub(console, 'error');
  });

  afterEach(() => {
    consoleLog.restore();
    consoleError.restore();
  });

  it('validate creating singleton instance loggers', () => {
    expect(Object.keys(log).length).to.equal(0);
    const healthman = log.healthman;
    const deviceman1 = log.deviceman;
    const deviceman2 = log.deviceman;
    expect(Object.keys(log).length).to.equal(2);
    expect(log.healthman).to.equal(healthman);
    expect(log.deviceman).to.equal(deviceman1);
    expect(log.deviceman).to.equal(deviceman2);
    expect(deviceman1).to.equal(deviceman2);
    expect(deviceman1).to.not.equal(new Logger('deviceman'));
  });

  it('validate usage of loggers', () => {
    const msg = 'Test 3';
    log.healthman.debug('Test 1');
    log.deviceman.info('%s %d', 'Test', 2);
    log.healthman.warn(msg);
    log.deviceman.error(['Test', '4']);
    sinon.assert.calledWithExactly(consoleLog.getCall(0), 'DBG:healthman:Test 1');
    sinon.assert.calledWithExactly(consoleLog.getCall(1), 'INF:deviceman:%s %d', 'Test', 2);
    sinon.assert.calledWithExactly(consoleLog.getCall(2), 'WRN:healthman:Test 3');
    sinon.assert.calledOnceWithExactly(consoleError, 'ERR:deviceman:Test,4');
  });
});
