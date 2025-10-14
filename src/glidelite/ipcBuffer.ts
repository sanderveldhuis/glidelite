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

import { IpcMessage } from './ipcMessage';

const IPC_FRAME_START = '[GLS]';
const IPC_FRAME_STOP = '[GLE]';
const IPC_BUFFER_SIZE = 1000000; // 1MB

/**
 * An IPC buffer for Inter-Process Communication used to filter messages out of the TCP data which could consist of complete, incomplete, or multiple IPC messages.
 */
export class IpcBuffer {
  _buffer = '';

  /**
   * Filter messages out of the TCP data which could consist of complete, incomplete, or multiple IPC messages.
   * @details incomplete IPC messages are stored in a buffer untill the rest of the message is available
   * @param data the TCP data
   * @returns the filtered IPC messages
   */
  filter(data: string): IpcMessage[] {
    const messages: IpcMessage[] = [];

    // Merge data in buffer
    this._buffer += data;

    // Split buffer into separate payloads
    const payloads = this._buffer.split(IPC_FRAME_START);
    // Always remove first element, contains either an empty string or data not starting with the start frame (not belonging to any message)
    payloads.shift();
    // Stop and clear buffer if no start frame is found
    if (payloads.length <= 0) {
      // Always keep the last characters as it could contains the start frame partly
      this._buffer = this._buffer.substring(this._buffer.length - IPC_FRAME_START.length);
      return [];
    }

    // Try to deserialize each payload into an IPC message
    for (let payload of payloads) {
      // Ignore payload if it does not contain an end frame (message not complete)
      if (!payload.includes(IPC_FRAME_STOP)) {
        continue;
      }

      // Strip everything after the end frame (not belonging to current message)
      payload = payload.split(IPC_FRAME_STOP)[0];

      // Deserialize the payload into an IPC message
      const message = IpcMessage.deserialize(payload);
      if (message) {
        messages.push(message);
      }
    }

    // Store everything after the last end frame (could belong to an incomplete message)
    const index = this._buffer.lastIndexOf(IPC_FRAME_STOP);
    if (index > -1) {
      this._buffer = this._buffer.substring(index + IPC_FRAME_STOP.length);
    }

    // Prevent overflooding the buffer with maximum size
    if (this._buffer.length > IPC_BUFFER_SIZE) {
      this._buffer = this._buffer.slice(this._buffer.length - IPC_BUFFER_SIZE);
    }

    return messages;
  }
}
