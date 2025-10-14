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

const IPC_TYPES: string[] = ['subscribe', 'unsubscribe', 'publish', 'indication', 'request', 'response'];
export type IpcType = 'subscribe' | 'unsubscribe' | 'publish' | 'indication' | 'request' | 'response';
const PAYLOAD_TYPES: string[] = ['string', 'number', 'boolean', 'object', 'undefined'];
export type IpcPayload = string | number | boolean | object | null | undefined;

/**
 * An IPC message for Inter-Process Communication providing message serialization and deserialization.
 */
export class IpcMessage {
  name: string;
  type: Readonly<IpcType>;
  payload: IpcPayload;
  session: number | undefined;

  /**
   * Constructs a new IPC message.
   * @param name the message name
   * @param type the message type
   * @param payload the message payload (optional)
   * @param session the message session (optional)
   */
  constructor(name: string, type: IpcType, payload?: IpcPayload, session?: number) {
    this.name = name;
    this.type = type;
    this.payload = payload;
    this.session = session;
  }

  /**
   * Serializes the IPC message to payload.
   * @returns the message payload
   */
  serialize(): string {
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
    return `{"name":"${this.name}","type":"${this.type}"${this.session !== undefined ? `,"session":${String(this.session)}` : ''}${payload}}`;
  }

  /**
   * Deserializes the specified payload to an IPC message.
   * @param payload the message payload
   * @returns the IPC message, or `undefined` when the payload is not valid
   */
  static deserialize(payload: string): IpcMessage | undefined {
    try {
      // We always expect JSON payload
      const json = JSON.parse(payload) as object;

      // Validate JSON object and construct IPC message
      if (
        'name' in json && typeof json.name === 'string' &&
        'type' in json && typeof json.type === 'string' && IPC_TYPES.includes(json.type) &&
        (!('session' in json) || typeof json.session === 'number') &&
        (!('payload' in json) || PAYLOAD_TYPES.includes(typeof json.payload))
      ) {
        const payload = 'payload' in json && PAYLOAD_TYPES.includes(typeof json.payload) ? json.payload : undefined;
        const session = 'session' in json && typeof json.session === 'number' ? json.session : undefined;
        return new IpcMessage(json.name, json.type as IpcType, payload as IpcPayload, session);
      }
    }
    catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // No need to log an error as this should not happen
    }

    return undefined;
  }
}
