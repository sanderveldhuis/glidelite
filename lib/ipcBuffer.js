"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcBuffer = void 0;
const ipcMessage_1 = require("./ipcMessage");
const IPC_BUFFER_SIZE = 1000000; // 1MB
/**
 * An IPC buffer for Inter-Process Communication used to filter messages out of the TCP data which could consist of complete, incomplete, or multiple IPC messages.
 */
class IpcBuffer {
    constructor() {
        this._buffer = '';
    }
    /**
     * Filter messages out of the TCP data which could consist of complete, incomplete, or multiple IPC messages.
     * @details incomplete IPC messages are stored in a buffer untill the rest of the message is available
     * @param data the TCP data
     * @returns the filtered IPC messages
     */
    filter(data) {
        const messages = [];
        let startIndex = -1;
        // Merge data in buffer
        this._buffer += data;
        // Search for the first start frame
        startIndex = this._buffer.indexOf(ipcMessage_1.IpcFrameStart);
        // Stop and clear buffer if no start frame is found
        if (startIndex === -1) {
            // Always keep the last characters as it could contains the start frame partly
            this._buffer = this._buffer.substring(this._buffer.length - ipcMessage_1.IpcFrameStart.length);
            return [];
        }
        // Try to deserialize each payload into an IPC message
        do {
            // Search for and end frame after the start frame
            const endIndex = this._buffer.indexOf(ipcMessage_1.IpcFrameEnd, startIndex);
            // Stop if no end frame is found (message not complete)
            if (endIndex === -1) {
                break;
            }
            // Get message payload from the buffer
            const payload = this._buffer.substring(startIndex, endIndex + ipcMessage_1.IpcFrameEnd.length);
            // Deserialize the payload into an IPC message
            const message = ipcMessage_1.IpcMessage.deserialize(payload);
            if (message) {
                messages.push(message);
            }
            // Search for the next start frame after the end frame
            startIndex = this._buffer.indexOf(ipcMessage_1.IpcFrameStart, endIndex);
        } while (startIndex !== -1);
        // Store everything after the last end frame (could belong to an incomplete message)
        const endIndex = this._buffer.lastIndexOf(ipcMessage_1.IpcFrameEnd);
        if (endIndex !== -1) {
            this._buffer = this._buffer.substring(endIndex + ipcMessage_1.IpcFrameEnd.length);
        }
        // Prevent overflooding the buffer with maximum size
        if (this._buffer.length > IPC_BUFFER_SIZE) {
            this._buffer = this._buffer.slice(this._buffer.length - IPC_BUFFER_SIZE);
        }
        return messages;
    }
}
exports.IpcBuffer = IpcBuffer;
