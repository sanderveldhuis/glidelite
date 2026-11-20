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
import { websocket as backendWebsocket } from '../../src/glidelite/backend/websocket';
import { websocket as frontendWebsocket } from '../../src/glidelite/frontend/websocket';

describe('websocket.ts (backend)', () => {
  it('validate creating a WebSocket endpoint', () => {
    const endpoint = backendWebsocket({
      path: '/test',
      onConnection: () => {/* Empty */}
    });
    expect(((endpoint as object) as Record<symbol, unknown>)[Symbol.for('glidelite.websocket')]).to.be.equal(true);
  });
});

describe('websocket.ts (frontend)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Stubs the browser environment and returns the arguments the WebSocket was constructed with
  function stub(protocol: string, host: string): unknown[][] {
    const calls: unknown[][] = [];
    vi.stubGlobal('window', {
      location: { protocol, host },
      WebSocket: class {
        args: unknown[];
        constructor(...args: unknown[]) {
          this.args = args;
          calls.push(args);
        }
      }
    });
    return calls;
  }

  it('validate opening a WebSocket when the page is served over HTTPS', () => {
    const calls = stub('https:', 'example.com');
    frontendWebsocket('/test');
    expect(calls).to.deep.equal([['wss://example.com/ws/test', undefined]]);
  });

  it('validate opening a WebSocket when the page is served over HTTP', () => {
    const calls = stub('http:', 'localhost:5173');
    frontendWebsocket('/test?room=1');
    expect(calls).to.deep.equal([['ws://localhost:5173/ws/test?room=1', undefined]]);
  });

  it('validate opening a WebSocket with protocols', () => {
    const calls = stub('https:', 'example.com');
    frontendWebsocket('/test', ['v1', 'v2']);
    frontendWebsocket('/test', 'v1');
    expect(calls).to.deep.equal([
      ['wss://example.com/ws/test', ['v1', 'v2']],
      ['wss://example.com/ws/test', 'v1']
    ]);
  });
});
