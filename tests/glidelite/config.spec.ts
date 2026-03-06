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
  assert,
  expect
} from 'chai';
import * as path from 'node:path';
import sinon from 'ts-sinon';

// Just loading the `defineConfig` to prevent missing dependencies
import { defineConfig } from 'vite';
defineConfig({});

describe('config.ts', () => {
  it('validate not finding the GlideLite config', async () => {
    const dirname = sinon.stub(path, 'dirname') as sinon.SinonStub;
    dirname.returns(__dirname).returns(__dirname);

    try {
      await import(path.resolve('src/vite/config'));
      dirname.restore();
      assert.fail('import succeeded unexpectedly');
    }
    catch (error) {
      dirname.restore();
      expect(error).to.deep.equal(new Error('No glconfig.json file available'));
    }
  });

  it('validate finding the GlideLite config', async () => {
    const { glConfig } = await import(path.resolve('src/vite/config')); /* eslint-disable-line @typescript-eslint/no-unsafe-assignment */
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
    const result1 = glConfig.server.proxy['/api'].rewrite('/api/test1'); /* eslint-disable-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    expect(result1).to.equal('/test1');
    const result2 = glConfig.server.proxy['/api'].rewrite('/apitest1'); /* eslint-disable-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    expect(result2).to.equal('test1');
  });
});
