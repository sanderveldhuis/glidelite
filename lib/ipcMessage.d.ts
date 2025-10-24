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
export type IpcType = 'subscribe' | 'unsubscribe' | 'publish' | 'indication' | 'request' | 'response';
export type IpcPayload = string | number | boolean | object | null | undefined;
export declare const IpcFrameStart = "[GLS]";
export declare const IpcFrameEnd = "[GLE]";
/**
 * An IPC message for Inter-Process Communication providing message serialization and deserialization.
 */
export declare class IpcMessage {
    name: string;
    type: IpcType;
    payload: IpcPayload;
    session: number | undefined;
    /**
     * Constructs a new IPC message.
     * @param name the message name
     * @param type the message type
     * @param payload the message payload (optional)
     * @param session the message session (optional)
     */
    constructor(name: string, type: IpcType, payload?: IpcPayload, session?: number);
    /**
     * Serializes the IPC message to payload.
     * @returns the message payload
     */
    serialize(): string;
    /**
     * Deserializes the specified payload to an IPC message.
     * @param payload the message payload
     * @returns the IPC message, or `undefined` when the payload is not valid
     */
    static deserialize(payload: string): IpcMessage | undefined;
}
