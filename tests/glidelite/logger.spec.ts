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

import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';
import {
  log,
  Logger
} from '../../src/glidelite/backend/logger';

describe('logger.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {/*Emtpy*/});
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    vi.spyOn(Date, 'now').mockImplementation(() => {
      return 1234567890;
    });

    const msg = 'Test 3';
    log.healthman.debug('Test 1');
    log.deviceman.info('%s %d', 'Test', 2);
    log.healthman.warn(msg);
    log.deviceman.error(['Test', '4']);
    expect(consoleLog).toHaveBeenCalledTimes(3);
    expect(consoleLog).toHaveBeenNthCalledWith(1, '1234567890:DBG:healthman:Test 1');
    expect(consoleLog).toHaveBeenNthCalledWith(2, '1234567890:INF:deviceman:%s %d', 'Test', 2);
    expect(consoleLog).toHaveBeenNthCalledWith(3, '1234567890:WRN:healthman:Test 3');
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('1234567890:ERR:deviceman:Test,4');
  });
});
