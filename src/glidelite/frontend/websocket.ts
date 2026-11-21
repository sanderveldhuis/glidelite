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
/* eslint-disable */

/**
 * Opens a WebSocket towards an endpoint on the WebSocket server.
 * @param path the absolute path of the WebSocket endpoint
 * @param protocols the subprotocol(s) preferred to use, in order of preference
 * @details the WebSocket is not reconnected automatically, reconnect (with a back-off) from the `close` event when needed
 * @details
 * ```js
 * // Open a WebSocket and listen for messages
 * const ws = websocket('/echo');
 * ws.addEventListener('open', () => {
 *   ws.send(JSON.stringify({ hello: 'world' }));
 * });
 * ws.addEventListener('message', event => {
 *   console.log(event.data);
 * });
 * ```
 */
export function websocket(path: string, protocols?: string | string[]): WebSocket {
  // @ts-ignore
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // @ts-ignore
  return new window.WebSocket(`${protocol}//${window.location.host}/ws${path}`, protocols);
}
