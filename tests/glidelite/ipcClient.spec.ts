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
import * as net from 'node:net';
import sinon from 'ts-sinon';
import { IpcClient } from '../../src/glidelite/ipcClient';
import {
  IpcMessage,
  IpcPayload
} from '../../src/glidelite/ipcMessage';

describe('ipcClient.ts', () => {
  let indicationMsg: IpcMessage | undefined;
  let requestMsg: IpcMessage | undefined;
  let responseCb: ((payload?: IpcPayload) => void) | undefined;
  const socket = new net.Socket();
  const onIndication = (message: IpcMessage) => {
    indicationMsg = message;
  };
  const onRequest = (message: IpcMessage, response: (payload?: IpcPayload) => void) => {
    requestMsg = message;
    responseCb = response;
  };
  let client: IpcClient;
  let socketMock: sinon.SinonMock;
  let consoleError: sinon.SinonStub;

  beforeEach(() => {
    client = new IpcClient(socket, {}, onIndication, onRequest);
    socketMock = sinon.mock(socket);
    consoleError = sinon.stub(console, 'error');
  });

  afterEach(() => {
    socketMock.verify();
    consoleError.restore();
  });

  it('validate starting an IPC client', () => {
    socketMock.expects('on').once().withArgs('end');
    socketMock.expects('on').once().withArgs('error');
    socketMock.expects('on').once().withArgs('data');
    client.start();

    expect(client._socket).to.equal(socket);
    expect(client._buffer).to.not.equal(undefined);
    expect(Object.keys(client._publishCache).length).to.equal(0);
    expect(client._subscriptions.length).to.equal(0);
    expect(client._onIndication).to.equal(onIndication);
    expect(client._onRequest).to.equal(onRequest);
  });

  it('validate stopping an IPC client', () => {
    client._publishCache.test1 = new IpcMessage('test1', 'publish');
    client._publishCache.test2 = new IpcMessage('test2', 'publish');
    client._subscriptions.push('test1');
    client._subscriptions.push('test2');

    socketMock.expects('end').once();
    client.stop();

    expect(client._socket).to.equal(socket);
    expect(client._buffer).to.not.equal(undefined);
    expect(Object.keys(client._publishCache).length).to.equal(0);
    expect(client._subscriptions.length).to.equal(0);
    expect(client._onIndication).to.equal(onIndication);
    expect(client._onRequest).to.equal(onRequest);
  });

  it('validate checking if the socket open', () => {
    const stub = sinon.stub(socket, 'readyState');

    stub.value('opening');
    expect(client.isOpen()).to.equal(false);
    stub.value('open');
    expect(client.isOpen()).to.equal(true);
    stub.value('readOnly');
    expect(client.isOpen()).to.equal(false);
    stub.value('writeOnly');
    expect(client.isOpen()).to.equal(false);
    stub.value('closed');
    expect(client.isOpen()).to.equal(false);

    stub.restore();
  });

  it('validate publishing a message', () => {
    // No subscriptions and publish cache available
    const message1 = new IpcMessage('test1', 'publish', { result: true });
    client.publish('test1', message1);
    expect(Object.keys(client._publishCache).length).to.equal(1);
    expect(client._publishCache.test1).to.deep.equal(message1);

    // Message not yet existing in publish cache, subscription available
    const message2 = new IpcMessage('test2', 'publish', { result: false });
    client._subscriptions.push('test2');
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test2","type":"publish","payload":{"result":false}}[GLE]');
    client.publish('test2', message2);
    expect(Object.keys(client._publishCache).length).to.equal(2);
    expect(client._publishCache.test1).to.deep.equal(message1);
    expect(client._publishCache.test2).to.deep.equal(message2);

    // Message existing in publish cache, subscription not available
    client.publish('test1', message1);
    expect(Object.keys(client._publishCache).length).to.equal(2);
    expect(client._publishCache.test1).to.deep.equal(message1);
    expect(client._publishCache.test2).to.deep.equal(message2);
  });

  it('validate handling an end event', () => {
    socketMock.expects('end').once();
    client._onEnd();
  });

  it('validate handling an error event', () => {
    socketMock.expects('destroy').twice();

    // No error message
    client._onError(new Error());
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'ERR:ipc:client:');

    // No error message
    client._onError(new Error('Unknown error'));
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'ERR:ipc:client:Unknown error');
  });

  it('validate handling a data event', () => {
    // In this test we will not validate the buffer itself because it is tested in another test file

    // Message types which should not be handled
    client._onData(Buffer.from('[GLS]{"name":"test","type":"publish"}[GLE]'));
    client._onData(Buffer.from('[GLS]{"name":"test","type":"response"}[GLE]'));

    // Subscribe message
    expect(client._subscriptions.length).to.equal(0);
    client._onData(Buffer.from('[GLS]{"name":"test","type":"subscribe"}[GLE]'));
    expect(client._subscriptions.length).to.equal(1);
    expect(client._subscriptions[0]).to.equal('test');

    // Unsubscribe message
    client._onData(Buffer.from('[GLS]{"name":"test","type":"unsubscribe"}[GLE]'));
    expect(client._subscriptions.length).to.equal(0);

    // Indication message (should invoke the callback from the constructor)
    expect(indicationMsg).to.equal(undefined);
    client._onData(Buffer.from('[GLS]{"name":"test","type":"indication","payload":true}[GLE]'));
    expect(indicationMsg).to.not.equal(undefined);
    expect(indicationMsg?.name).to.equal('test');
    expect(indicationMsg?.type).to.equal('indication');
    expect(indicationMsg?.payload).to.equal(true);

    // Request message without session number
    expect(responseCb).to.equal(undefined);
    expect(requestMsg).to.equal(undefined);
    client._onData(Buffer.from('[GLS]{"name":"test","type":"request","payload":true}[GLE]'));
    expect(responseCb).to.equal(undefined);
    expect(requestMsg).to.equal(undefined);

    // Request message (should invoke the callback from the constructor)
    client._onData(Buffer.from('[GLS]{"name":"test","type":"request","payload":true,"session":99}[GLE]'));
    expect(responseCb).to.not.equal(undefined);
    expect(requestMsg).to.not.equal(undefined);
    expect(requestMsg?.name).to.equal('test');
    expect(requestMsg?.type).to.equal('request');
    expect(requestMsg?.payload).to.equal(true);
    expect(requestMsg?.session).to.equal(99);

    // Validate the response callback given in the previous step
    if (!responseCb) return; // Required to satisfy TypeScript
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test","type":"response","session":99}[GLE]');
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test","type":"response","session":99,"payload":{"result":true}}[GLE]');
    responseCb();
    responseCb({ result: true });
  });

  it('validate handling a subscription', () => {
    // No subscriptions and publish cache available
    client._onSubscribe(new IpcMessage('test1', 'subscribe'));
    expect(client._subscriptions.length).to.equal(1);
    expect(client._subscriptions[0]).to.equal('test1');
    client._onSubscribe(new IpcMessage('test2', 'subscribe'));
    expect(client._subscriptions.length).to.equal(2);
    expect(client._subscriptions[0]).to.equal('test1');
    expect(client._subscriptions[1]).to.equal('test2');

    // Subscription exists, no publish cache available
    client._onSubscribe(new IpcMessage('test1', 'subscribe'));
    client._onSubscribe(new IpcMessage('test2', 'subscribe'));
    expect(client._subscriptions.length).to.equal(2);
    expect(client._subscriptions[0]).to.equal('test1');
    expect(client._subscriptions[1]).to.equal('test2');

    // Subscription exists and publish cache available
    client._publishCache.test1 = new IpcMessage('test1', 'publish', 'should not be published');
    client._publishCache.test2 = new IpcMessage('test2', 'publish', 'should not be published');
    client._onSubscribe(new IpcMessage('test1', 'subscribe'));
    client._onSubscribe(new IpcMessage('test2', 'subscribe'));
    expect(client._subscriptions.length).to.equal(2);
    expect(client._subscriptions[0]).to.equal('test1');
    expect(client._subscriptions[1]).to.equal('test2');

    // Subscription does not exist and publish cache available
    client._publishCache.test3 = new IpcMessage('test3', 'publish', { result: true });
    client._publishCache.test4 = new IpcMessage('test4', 'publish', { result: false });
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test3","type":"publish","payload":{"result":true}}[GLE]');
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test4","type":"publish","payload":{"result":false}}[GLE]');
    client._onSubscribe(new IpcMessage('test3', 'subscribe'));
    client._onSubscribe(new IpcMessage('test4', 'subscribe'));
    expect(client._subscriptions.length).to.equal(4);
    expect(client._subscriptions[0]).to.equal('test1');
    expect(client._subscriptions[1]).to.equal('test2');
    expect(client._subscriptions[2]).to.equal('test3');
    expect(client._subscriptions[3]).to.equal('test4');
  });

  it('validate handling an unsubscription', () => {
    // No subscriptions available
    client._onUnsubscribe(new IpcMessage('test1', 'unsubscribe'));
    expect(client._subscriptions.length).to.equal(0);

    // Subscriptions available, but not for the specified name
    client._subscriptions.push('test2');
    client._subscriptions.push('test3');
    client._subscriptions.push('test4');
    client._onUnsubscribe(new IpcMessage('test1', 'unsubscribe'));
    expect(client._subscriptions.length).to.equal(3);
    expect(client._subscriptions[0]).to.equal('test2');
    expect(client._subscriptions[1]).to.equal('test3');
    expect(client._subscriptions[2]).to.equal('test4');

    // Subscriptions available for the specified name
    client._onUnsubscribe(new IpcMessage('test3', 'unsubscribe'));
    expect(client._subscriptions.length).to.equal(2);
    expect(client._subscriptions[0]).to.equal('test2');
    expect(client._subscriptions[1]).to.equal('test4');
    client._onUnsubscribe(new IpcMessage('test2', 'unsubscribe'));
    expect(client._subscriptions.length).to.equal(1);
    expect(client._subscriptions[0]).to.equal('test4');
    client._onUnsubscribe(new IpcMessage('test4', 'unsubscribe'));
    expect(client._subscriptions.length).to.equal(0);
  });
});
