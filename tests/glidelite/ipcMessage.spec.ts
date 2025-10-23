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

import { expect } from 'chai';
import { IpcMessage } from '../../src/glidelite/ipcMessage';

describe('ipcMessage.ts', () => {
  it('validate serializing to payload', () => {
    // Validate all type field values
    let message = new IpcMessage('msg1', 'subscribe');
    let payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg1","type":"subscribe"}[GLE]');
    message = new IpcMessage('msg2', 'unsubscribe');
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg2","type":"unsubscribe"}[GLE]');
    message = new IpcMessage('msg3', 'publish');
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg3","type":"publish"}[GLE]');
    message = new IpcMessage('msg4', 'indication');
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg4","type":"indication"}[GLE]');
    message = new IpcMessage('msg5', 'request');
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg5","type":"request"}[GLE]');
    message = new IpcMessage('msg6', 'response');
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg6","type":"response"}[GLE]');

    // Validate all payload field values
    message = new IpcMessage('msg7', 'publish', undefined);
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg7","type":"publish"}[GLE]');
    message = new IpcMessage('msg8', 'publish', null);
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg8","type":"publish","payload":null}[GLE]');
    message = new IpcMessage('msg9', 'publish', 'Hello, World!');
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg9","type":"publish","payload":"Hello, World!"}[GLE]');
    message = new IpcMessage('msg1', 'publish', 1234);
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg1","type":"publish","payload":1234}[GLE]');
    message = new IpcMessage('msg2', 'publish', true);
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg2","type":"publish","payload":true}[GLE]');
    message = new IpcMessage('msg3', 'publish', false);
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg3","type":"publish","payload":false}[GLE]');
    message = new IpcMessage('msg4', 'publish', [1, 2, 3]);
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg4","type":"publish","payload":[1,2,3]}[GLE]');
    message = new IpcMessage('msg5', 'publish', { hello: 'world', extra: { deep: [1, 2, 3] } });
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg5","type":"publish","payload":{"hello":"world","extra":{"deep":[1,2,3]}}}[GLE]');

    // Validate all session field values
    message = new IpcMessage('msg6', 'publish', undefined, undefined);
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg6","type":"publish"}[GLE]');
    message = new IpcMessage('msg7', 'publish', undefined, 0);
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg7","type":"publish","session":0}[GLE]');
    message = new IpcMessage('msg8', 'publish', 0, undefined);
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg8","type":"publish","payload":0}[GLE]');
    message = new IpcMessage('msg8', 'publish', 0, 1234);
    payload = message.serialize();
    expect(payload).to.be.equal('[GLS]{"name":"msg8","type":"publish","session":1234,"payload":0}[GLE]');
  });

  it('validate deserializing with invalid JSON structure as payload', () => {
    // No data
    let message = IpcMessage.deserialize('');
    expect(message).to.be.equal(undefined);

    // No start and end frame
    message = IpcMessage.deserialize('invalid');
    expect(message).to.be.equal(undefined);

    // No start frame
    message = IpcMessage.deserialize('{}[GLE]');
    expect(message).to.be.equal(undefined);

    // No end frame
    message = IpcMessage.deserialize('[GLS]{}');
    expect(message).to.be.equal(undefined);
  });

  it('validate deserializing with missing or invalid JSON key as payload', () => {
    // Missing keys
    let message = IpcMessage.deserialize('[GLS]{}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"missing type"}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"type":"missing name"}[GLE]');
    expect(message).to.be.equal(undefined);

    // Wrong name field datatype
    message = IpcMessage.deserialize('[GLS]{"name":1,"type":"publish"}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":true,"type":"publish"}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":null,"type":"publish"}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":[1,2,3],"type":"publish"}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":{"invalid":"key"},"type":"publish"}[GLE]');
    expect(message).to.be.equal(undefined);

    // Wrong type field datatype
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":1}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":true}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":null}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":[1,2,3]}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":{"invalid":"key"}}[GLE]');
    expect(message).to.be.equal(undefined);

    // Wrong type field value
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":"publis"}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":"subscrib"}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":"unsubscribee"}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":"indicationn"}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":"reques"}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":"respons"}[GLE]');
    expect(message).to.be.equal(undefined);

    // Wrong session field datatype
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":"publish","session":"invalid"}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":"publish","session":true}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":"publish","session":null}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":"publish","session":[1,2,3]}[GLE]');
    expect(message).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"valid","type":"publish","session":{"invalid":"key"}}[GLE]');
    expect(message).to.be.equal(undefined);
  });

  it('validate deserializing with correct payload', () => {
    // Validate all type field values
    let message = IpcMessage.deserialize('[GLS]{"name":"msg1","type":"publish"}[GLE]');
    expect(message?.name).to.be.equal('msg1');
    expect(message?.type).to.be.equal('publish');
    expect(message?.payload).to.be.equal(undefined);
    expect(message?.session).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"msg2","type":"subscribe"}[GLE]');
    expect(message?.name).to.be.equal('msg2');
    expect(message?.type).to.be.equal('subscribe');
    expect(message?.payload).to.be.equal(undefined);
    expect(message?.session).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"msg3","type":"unsubscribe"}[GLE]');
    expect(message?.name).to.be.equal('msg3');
    expect(message?.type).to.be.equal('unsubscribe');
    expect(message?.payload).to.be.equal(undefined);
    expect(message?.session).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"msg4","type":"indication"}[GLE]');
    expect(message?.name).to.be.equal('msg4');
    expect(message?.type).to.be.equal('indication');
    expect(message?.payload).to.be.equal(undefined);
    expect(message?.session).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"msg5","type":"request"}[GLE]');
    expect(message?.name).to.be.equal('msg5');
    expect(message?.type).to.be.equal('request');
    expect(message?.payload).to.be.equal(undefined);
    expect(message?.session).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"msg6","type":"response"}[GLE]');
    expect(message?.name).to.be.equal('msg6');
    expect(message?.type).to.be.equal('response');
    expect(message?.payload).to.be.equal(undefined);
    expect(message?.session).to.be.equal(undefined);

    // Validate all payload field values
    message = IpcMessage.deserialize('[GLS]{"name":"msg7","type":"publish","payload":null}[GLE]');
    expect(message?.name).to.be.equal('msg7');
    expect(message?.type).to.be.equal('publish');
    expect(message?.payload).to.be.equal(null);
    expect(message?.session).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"msg8","type":"publish","payload":"Hello, World!"}[GLE]');
    expect(message?.name).to.be.equal('msg8');
    expect(message?.type).to.be.equal('publish');
    expect(typeof message?.payload).to.be.equal('string');
    expect(message?.payload).to.be.equal('Hello, World!');
    expect(message?.session).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"msg9","type":"publish","payload":1234}[GLE]');
    expect(message?.name).to.be.equal('msg9');
    expect(message?.type).to.be.equal('publish');
    expect(typeof message?.payload).to.be.equal('number');
    expect(message?.payload).to.be.equal(1234);
    expect(message?.session).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"msg1","type":"publish","payload":true}[GLE]');
    expect(message?.name).to.be.equal('msg1');
    expect(message?.type).to.be.equal('publish');
    expect(typeof message?.payload).to.be.equal('boolean');
    expect(message?.payload).to.be.equal(true);
    expect(message?.session).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"msg2","type":"publish","payload":false}[GLE]');
    expect(message?.name).to.be.equal('msg2');
    expect(message?.type).to.be.equal('publish');
    expect(typeof message?.payload).to.be.equal('boolean');
    expect(message?.payload).to.be.equal(false);
    expect(message?.session).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"msg3","type":"publish","payload":[1,2,3]}[GLE]');
    expect(message?.name).to.be.equal('msg3');
    expect(message?.type).to.be.equal('publish');
    expect(typeof message?.payload).to.be.equal('object');
    expect(message?.payload).to.be.deep.equal([1, 2, 3]);
    expect(message?.session).to.be.equal(undefined);
    message = IpcMessage.deserialize('[GLS]{"name":"msg4","type":"publish","payload":{"hello":"world","extra":{"deep":[1,2,3]}}}[GLE]');
    expect(message?.name).to.be.equal('msg4');
    expect(message?.type).to.be.equal('publish');
    expect(typeof message?.payload).to.be.equal('object');
    expect(message?.payload).to.be.deep.equal({ hello: 'world', extra: { deep: [1, 2, 3] } });
    expect(message?.session).to.be.equal(undefined);

    // Validate session value
    message = IpcMessage.deserialize('[GLS]{"name":"msg5","type":"publish","session":0}[GLE]');
    expect(message?.name).to.be.equal('msg5');
    expect(message?.type).to.be.equal('publish');
    expect(message?.payload).to.be.equal(undefined);
    expect(message?.session).to.be.equal(0);
    message = IpcMessage.deserialize('[GLS]{"name":"msg6","type":"publish","session":1,"payload":"Hello, World!"}[GLE]');
    expect(message?.name).to.be.equal('msg6');
    expect(message?.type).to.be.equal('publish');
    expect(typeof message?.payload).to.be.equal('string');
    expect(message?.payload).to.be.equal('Hello, World!');
    expect(message?.session).to.be.equal(1);
    message = IpcMessage.deserialize('[GLS]{"name":"msg7","type":"publish","session":2147483647,"payload":"Hello, World!"}[GLE]');
    expect(message?.name).to.be.equal('msg7');
    expect(message?.type).to.be.equal('publish');
    expect(typeof message?.payload).to.be.equal('string');
    expect(message?.payload).to.be.equal('Hello, World!');
    expect(message?.session).to.be.equal(2147483647);
  });
});
