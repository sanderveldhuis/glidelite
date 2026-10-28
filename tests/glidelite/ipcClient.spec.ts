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

import net from 'node:net';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';
import { IpcClient } from '../../src/glidelite/backend/ipcClient';
import {
  IpcMessage,
  IpcPayload
} from '../../src/glidelite/backend/ipcMessage';

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

  beforeEach(() => {
    client = new IpcClient(socket, {}, onIndication, onRequest);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validate starting an IPC client', () => {
    // @ts-expect-error because function has return type Socket
    const socketOn = vi.spyOn(client._socket, 'on').mockImplementation(() => {/*Empty*/});
    // @ts-expect-error because function has return type Socket
    const socketRemoveAllListeners = vi.spyOn(client._socket, 'removeAllListeners').mockImplementation(() => {/*Empty*/});

    client.start();
    expect(socketRemoveAllListeners).toHaveBeenCalledTimes(1);
    expect(socketRemoveAllListeners).toHaveBeenLastCalledWith();
    expect(socketOn).toHaveBeenCalledTimes(3);
    expect(socketOn).toHaveBeenNthCalledWith(1, 'end', expect.anything());
    expect(socketOn).toHaveBeenNthCalledWith(2, 'error', expect.anything());
    expect(socketOn).toHaveBeenNthCalledWith(3, 'data', expect.anything());
    expect(client._socket).to.equal(socket);
    expect(client._buffer).to.not.equal(undefined);
    expect(Object.keys(client._publishCache).length).to.equal(0);
    expect(client._subscriptions.length).to.equal(0);
    expect(client._onIndication).to.equal(onIndication);
    expect(client._onRequest).to.equal(onRequest);
  });

  it('validate stopping an IPC client', () => {
    // @ts-expect-error because function has return type Socket
    const socketEnd = vi.spyOn(client._socket, 'end').mockImplementation(() => {/*Empty*/});

    client._publishCache.test1 = new IpcMessage('test1', 'publish');
    client._publishCache.test2 = new IpcMessage('test2', 'publish');
    client._subscriptions.push('test1');
    client._subscriptions.push('test2');
    client.stop();
    expect(socketEnd).toHaveBeenCalledTimes(1);
    expect(socketEnd).toHaveBeenLastCalledWith();
    expect(client._socket).to.equal(socket);
    expect(client._buffer).to.not.equal(undefined);
    expect(Object.keys(client._publishCache).length).to.equal(2);
    expect(client._subscriptions.length).to.equal(0);
    expect(client._onIndication).to.equal(onIndication);
    expect(client._onRequest).to.equal(onRequest);
  });

  it('validate checking if the socket open', () => {
    const socketDestroyed = vi.spyOn(client._socket, 'destroyed', 'get');
    const socketWritable = vi.spyOn(client._socket, 'writable', 'get');
    const socketReadable = vi.spyOn(client._socket, 'readable', 'get');

    socketDestroyed.mockReturnValue(false);
    socketWritable.mockReturnValue(true);
    socketReadable.mockReturnValue(true);
    expect(client.isOpen()).to.equal(true);

    socketDestroyed.mockReturnValue(true);
    socketWritable.mockReturnValue(true);
    socketReadable.mockReturnValue(true);
    expect(client.isOpen()).to.equal(false);

    socketDestroyed.mockReturnValue(false);
    socketWritable.mockReturnValue(false);
    socketReadable.mockReturnValue(true);
    expect(client.isOpen()).to.equal(false);

    socketDestroyed.mockReturnValue(false);
    socketWritable.mockReturnValue(true);
    socketReadable.mockReturnValue(false);
    expect(client.isOpen()).to.equal(false);
  });

  it('validate publishing a message', () => {
    // @ts-expect-error because function has return type boolean
    const socketWrite = vi.spyOn(client._socket, 'write').mockImplementation(() => {/*Empty*/});

    // No subscriptions available
    client.publish('test1', new IpcMessage('test1', 'publish', { result: true }));
    expect(socketWrite).toHaveBeenCalledTimes(0);

    // Subscription available
    client._subscriptions.push('test2');
    client._subscriptions.push('test3');
    client.publish('test2', new IpcMessage('test2', 'publish', { result: false }));
    expect(socketWrite).toHaveBeenCalledTimes(1);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test2","type":"publish","payload":{"result":false}}[GLE]');

    // Subscription not available
    client.publish('test1', new IpcMessage('test1', 'publish', { result: true }));
    expect(socketWrite).toHaveBeenCalledTimes(1);
  });

  it('validate handling an end event', () => {
    // @ts-expect-error because function has return type Socket
    const socketEnd = vi.spyOn(client._socket, 'end').mockImplementation(() => {/*Empty*/});

    client._onEnd();
    expect(socketEnd).toHaveBeenCalledTimes(1);
    expect(socketEnd).toHaveBeenLastCalledWith();
  });

  it('validate handling an error event', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type Socket
    const socketDestroy = vi.spyOn(client._socket, 'destroy').mockImplementation(() => {/*Empty*/});
    vi.spyOn(Date, 'now').mockImplementation(() => {
      return 1234567890;
    });

    // No error message
    client._onError(new Error());
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('1234567890:ERR:ipc:client:');
    expect(socketDestroy).toHaveBeenCalledTimes(1);
    expect(socketDestroy).toHaveBeenLastCalledWith();

    // With error message
    client._onError(new Error('Unknown error'));
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith('1234567890:ERR:ipc:client:Unknown error');
    expect(socketDestroy).toHaveBeenCalledTimes(2);
    expect(socketDestroy).toHaveBeenLastCalledWith();
  });

  it('validate handling a data event', () => {
    // @ts-expect-error because function has return type Socket
    const socketWrite = vi.spyOn(client._socket, 'write').mockImplementation(() => {/*Empty*/});

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
    responseCb();
    expect(socketWrite).toHaveBeenCalledTimes(1);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test","type":"response","session":99}[GLE]');
    responseCb({ result: true });
    expect(socketWrite).toHaveBeenCalledTimes(2);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test","type":"response","session":99,"payload":{"result":true}}[GLE]');
  });

  it('validate handling a subscription', () => {
    // @ts-expect-error because function has return type Socket
    const socketWrite = vi.spyOn(client._socket, 'write').mockImplementation(() => {/*Empty*/});

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
    client._onSubscribe(new IpcMessage('test3', 'subscribe'));
    expect(socketWrite).toHaveBeenCalledTimes(1);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test3","type":"publish","payload":{"result":true}}[GLE]');
    client._onSubscribe(new IpcMessage('test4', 'subscribe'));
    expect(socketWrite).toHaveBeenCalledTimes(2);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test4","type":"publish","payload":{"result":false}}[GLE]');
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
