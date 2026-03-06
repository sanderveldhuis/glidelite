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
exports.IpcMessage = exports.IpcFrameEnd = exports.IpcFrameStart = void 0;
const IPC_TYPES = ['subscribe', 'unsubscribe', 'publish', 'indication', 'request', 'response'];
const PAYLOAD_TYPES = ['string', 'number', 'boolean', 'object', 'undefined'];
exports.IpcFrameStart = '[GLS]';
exports.IpcFrameEnd = '[GLE]';
/**
 * An IPC message for Inter-Process Communication providing message serialization and deserialization.
 */
class IpcMessage {
    /**
     * Constructs a new IPC message.
     * @param name the message name
     * @param type the message type
     * @param payload the message payload (optional)
     * @param session the message session (optional)
     */
    constructor(name, type, payload, session) {
        this.name = name;
        this.type = type;
        this.payload = payload;
        this.session = session;
    }
    /**
     * Serializes the IPC message to payload.
     * @returns the message payload
     */
    serialize() {
        let payload = '';
        switch (typeof this.payload) {
            case 'string':
                payload = `,"payload":"${this.payload}"`;
                break;
            case 'number':
                payload = `,"payload":${String(this.payload)}`;
                break;
            case 'boolean':
                payload = `,"payload":${this.payload ? 'true' : 'false'}`;
                break;
            case 'object':
                payload = `,"payload":${JSON.stringify(this.payload)}`;
                break;
            default:
                break;
        }
        return `${exports.IpcFrameStart}{"name":"${this.name}","type":"${this.type}"${this.session !== undefined ? `,"session":${String(this.session)}` : ''}${payload}}${exports.IpcFrameEnd}`;
    }
    /**
     * Deserializes the specified payload to an IPC message.
     * @param payload the message payload
     * @returns the IPC message, or `undefined` when the payload is not valid
     */
    static deserialize(payload) {
        // Check start and end frame
        if (!payload.startsWith(exports.IpcFrameStart) || !payload.endsWith(exports.IpcFrameEnd)) {
            return undefined;
        }
        // Remove start and end frame
        const data = payload.substring(exports.IpcFrameStart.length, payload.length - exports.IpcFrameEnd.length);
        try {
            // We always expect JSON payload
            const json = JSON.parse(data);
            // Validate JSON object and construct IPC message
            if ('name' in json && typeof json.name === 'string' &&
                'type' in json && typeof json.type === 'string' && IPC_TYPES.includes(json.type) &&
                (!('session' in json) || typeof json.session === 'number') &&
                (!('payload' in json) || PAYLOAD_TYPES.includes(typeof json.payload))) {
                const payload = 'payload' in json && PAYLOAD_TYPES.includes(typeof json.payload) ? json.payload : undefined;
                const session = 'session' in json && typeof json.session === 'number' ? json.session : undefined;
                return new IpcMessage(json.name, json.type, payload, session);
            }
        }
        catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
            // No need to log an error as this should not happen
        }
        return undefined;
    }
}
exports.IpcMessage = IpcMessage;
