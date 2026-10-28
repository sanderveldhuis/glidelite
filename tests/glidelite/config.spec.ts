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

import path from 'node:path';
import {
  afterEach,
  assert,
  describe,
  expect,
  it,
  vi
} from 'vitest';

vi.mock('node:path');

// Just loading the `defineConfig` to prevent missing dependencies
import { defineConfig } from 'vite';
defineConfig({});

describe('config.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validate not finding the GlideLite config', async () => {
    vi.spyOn(path, 'join').mockImplementation((...args: string[]) => args.join('/'));
    vi.spyOn(path, 'dirname').mockReturnValue(`${__dirname}/../..`);

    try {
      // Append a unique query string to trick the loader into thinking it's a new file ensuring it is newly imported
      await import(`${__dirname}/../../src/vite/config?test=1`);
      assert.fail('import succeeded unexpectedly');
    }
    catch (error) {
      expect(error).to.deep.equal(new Error('No glconfig.json file available'));
    }
  });

  it('validate finding the GlideLite config with port', async () => {
    vi.spyOn(path, 'join').mockImplementation((...args: string[]) => args.join('/'));
    vi.spyOn(path, 'dirname').mockReturnValue(`${__dirname}/..`);

    // Append a unique query string to trick the loader into thinking it's a new file ensuring it is newly imported
    const { glConfig } = await import(`${__dirname}/../../src/vite/config?test=2`); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
    expect(glConfig).to.deep.equal({
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:12345',
            rewrite: glConfig.server.proxy['/api'].rewrite /* eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
          }
        }
      }
    });

    // Test rewrite function
    expect(glConfig.server.proxy['/api'].rewrite('/api/test1')).to.equal('/test1'); /* eslint-disable-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    expect(glConfig.server.proxy['/api'].rewrite('/apitest1')).to.equal('test1'); /* eslint-disable-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  });

  it('validate finding the GlideLite config without port', async () => {
    vi.spyOn(path, 'join').mockImplementation((...args: string[]) => args.join('/'));
    vi.spyOn(path, 'dirname').mockReturnValue(__dirname);

    // Append a unique query string to trick the loader into thinking it's a new file ensuring it is newly imported
    const { glConfig } = await import(`${__dirname}/../../src/vite/config?test=3`); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
    expect(glConfig).to.deep.equal({
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:9002',
            rewrite: glConfig.server.proxy['/api'].rewrite /* eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
          }
        }
      }
    });

    // Test rewrite function
    expect(glConfig.server.proxy['/api'].rewrite('/api/test1')).to.equal('/test1'); /* eslint-disable-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    expect(glConfig.server.proxy['/api'].rewrite('/apitest1')).to.equal('test1'); /* eslint-disable-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  });
});
