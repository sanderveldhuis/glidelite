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
import * as fs from 'node:fs';
import * as net from 'node:net';
import sinon from 'ts-sinon';
import { IpcImpl } from '../../src/glidelite/ipc';
import { IpcClient } from '../../src/glidelite/ipcClient';
import { IpcEndpointImpl } from '../../src/glidelite/ipcEndpoint';
import {
  IpcMessage,
  IpcPayload
} from '../../src/glidelite/ipcMessage';

describe('ipc.ts', () => {
  let ipc: IpcImpl;
  const endpoint1 = new IpcEndpointImpl('');
  const endpoint2 = new IpcEndpointImpl('');
  const client1 = new IpcClient(new net.Socket(), {}, () => {
    // Not used
  }, () => {
    // Not used
  });
  const client2 = new IpcClient(new net.Socket(), {}, () => {
    // Not used
  }, () => {
    // Not used
  });
  let serverMock: sinon.SinonMock;
  let endpoint1Mock: sinon.SinonMock;
  let endpoint2Mock: sinon.SinonMock;
  let client1Mock: sinon.SinonMock;
  let client2Mock: sinon.SinonMock;
  let consoleError: sinon.SinonStub;
  let rmSync: sinon.SinonStub;
  let fakeTimer: sinon.SinonFakeTimers;

  beforeEach(() => {
    ipc = new IpcImpl();
    serverMock = sinon.mock(ipc._server);
    endpoint1Mock = sinon.mock(endpoint1);
    endpoint2Mock = sinon.mock(endpoint2);
    client1Mock = sinon.mock(client1);
    client2Mock = sinon.mock(client2);
    consoleError = sinon.stub(console, 'error');
    rmSync = sinon.stub(fs, 'rmSync');
    fakeTimer = sinon.useFakeTimers(1234567890);
  });

  afterEach(() => {
    serverMock.verify();
    endpoint1Mock.verify();
    endpoint2Mock.verify();
    client1Mock.verify();
    client2Mock.verify();
    consoleError.restore();
    rmSync.restore();
    fakeTimer.restore();
  });

  it('validate starting IPC', () => {
    serverMock.expects('close').twice();
    serverMock.expects('removeAllListeners').twice();
    serverMock.expects('on').twice().withArgs('error');
    serverMock.expects('on').twice().withArgs('connection');
    serverMock.expects('listen').twice();

    // No endpoints defined
    ipc.start('test1');
    expect(ipc._name).to.equal('test1');
    expect(Object.keys(ipc.to).length).to.equal(0);
    if ('win32' === process.platform) {
      expect(ipc._path).to.match(new RegExp(/^\\\\\.\\pipe\\.*\\test1$/));
    }
    else {
      expect(ipc._path).to.match(/^.*\/ipc_test1$/);
      sinon.assert.calledWithExactly(rmSync.getCall(0), ipc._path, { force: true });
    }

    // Endpoints defined
    ipc.start('test2', 'endpoint1', 'endpoint2');
    expect(ipc._name).to.equal('test2');
    expect(Object.keys(ipc.to).length).to.equal(2);
    expect(ipc.to.endpoint1).to.not.equal(undefined);
    expect(ipc.to.endpoint2).to.not.equal(undefined);
    if ('win32' === process.platform) {
      expect(ipc._path).to.match(new RegExp(/^\\\\\.\\pipe\\.*\\test2$/));
    }
    else {
      expect(ipc._path).to.match(/^.*\/ipc_test2$/);
      sinon.assert.calledWithExactly(rmSync.getCall(1), ipc._path, { force: true });
    }

    // Cleanup
    for (const endpoint of Object.values(ipc.to)) {
      endpoint.stop();
    }
  });

  it('validate stopping IPC', () => {
    ipc._retryTimer = setTimeout(() => {
      // Should not happen
    }, 1000);
    ipc._indicationCallbacks.push(() => {
      // Not used
    });
    ipc._requestCallbacks.push(() => {
      // Not used
    });
    ipc._publishCache.test = new IpcMessage('test', 'publish');
    ipc.to.endpoint1 = endpoint1;
    ipc.to.endpoint2 = endpoint2;
    ipc._clients.push(client1);
    ipc._clients.push(client2);

    serverMock.expects('close').once();
    serverMock.expects('removeAllListeners').once();
    endpoint1Mock.expects('stop').once();
    endpoint2Mock.expects('stop').once();
    client1Mock.expects('stop').once();
    client2Mock.expects('stop').once();
    ipc.stop();

    expect(ipc._server).to.not.equal(undefined);
    expect(ipc._retryTimer).to.not.equal(undefined);
    expect(Object.keys(ipc._publishCache).length).to.equal(0);
    expect(ipc._clients.length).to.equal(0);
    expect(ipc._indicationCallbacks.length).to.equal(0);
    expect(ipc._requestCallbacks.length).to.equal(0);
    expect(Object.keys(ipc.to).length).to.equal(0);
  });

  it('validate publishing a message', () => {
    // Message not existing in cache and no clients available
    ipc.publish('test1');
    ipc.publish('test2', true);
    expect(Object.keys(ipc._publishCache).length).to.equal(2);
    expect(ipc._publishCache.test1.name).to.equal('test1');
    expect(ipc._publishCache.test1.type).to.equal('publish');
    expect(ipc._publishCache.test1.payload).to.equal(undefined);
    expect(ipc._publishCache.test1.session).to.equal(undefined);
    expect(ipc._publishCache.test2.name).to.equal('test2');
    expect(ipc._publishCache.test2.type).to.equal('publish');
    expect(ipc._publishCache.test2.payload).to.equal(true);
    expect(ipc._publishCache.test2.session).to.equal(undefined);

    // Message existing in publish cache and clients available
    client1Mock.expects('publish').once().withArgs('test1');
    client1Mock.expects('publish').once().withArgs('test2');
    client2Mock.expects('publish').once().withArgs('test1');
    client2Mock.expects('publish').once().withArgs('test2');
    ipc._clients.push(client1);
    ipc._clients.push(client2);
    ipc.publish('test1');
    ipc.publish('test2', true);
    expect(Object.keys(ipc._publishCache).length).to.equal(2);
    expect(ipc._publishCache.test1.name).to.equal('test1');
    expect(ipc._publishCache.test1.type).to.equal('publish');
    expect(ipc._publishCache.test1.payload).to.equal(undefined);
    expect(ipc._publishCache.test1.session).to.equal(undefined);
    expect(ipc._publishCache.test2.name).to.equal('test2');
    expect(ipc._publishCache.test2.type).to.equal('publish');
    expect(ipc._publishCache.test2.payload).to.equal(true);
    expect(ipc._publishCache.test2.session).to.equal(undefined);
  });

  it('validate registering an indication callback', () => {
    const callback1 = () => {
      // Nothing to do
    };
    const callback2 = () => {
      // Nothing to do
    };

    // Indication callbacks do not exist
    ipc.onIndication(callback1);
    expect(ipc._indicationCallbacks.length).to.equal(1);
    expect(ipc._indicationCallbacks[0]).to.equal(callback1);
    ipc.onIndication(callback2);
    expect(ipc._indicationCallbacks.length).to.equal(2);
    expect(ipc._indicationCallbacks[0]).to.equal(callback1);
    expect(ipc._indicationCallbacks[1]).to.equal(callback2);

    // Indication callbacks do exist
    ipc.onIndication(callback1);
    ipc.onIndication(callback2);
    expect(ipc._indicationCallbacks.length).to.equal(2);
    expect(ipc._indicationCallbacks[0]).to.equal(callback1);
    expect(ipc._indicationCallbacks[1]).to.equal(callback2);
  });

  it('validate registering a request callback', () => {
    const callback1 = () => {
      // Nothing to do
    };
    const callback2 = () => {
      // Nothing to do
    };

    // Indication callbacks do not exist
    ipc.onRequest(callback1);
    expect(ipc._requestCallbacks.length).to.equal(1);
    expect(ipc._requestCallbacks[0]).to.equal(callback1);
    ipc.onRequest(callback2);
    expect(ipc._requestCallbacks.length).to.equal(2);
    expect(ipc._requestCallbacks[0]).to.equal(callback1);
    expect(ipc._requestCallbacks[1]).to.equal(callback2);

    // Indication callbacks do exist
    ipc.onRequest(callback1);
    ipc.onRequest(callback2);
    expect(ipc._requestCallbacks.length).to.equal(2);
    expect(ipc._requestCallbacks[0]).to.equal(callback1);
    expect(ipc._requestCallbacks[1]).to.equal(callback2);
  });

  it('validate starting the server', () => {
    ipc._path = 'test';
    serverMock.expects('on').once().withArgs('error');
    serverMock.expects('on').once().withArgs('connection');
    serverMock.expects('listen').once().withExactArgs('test');
    ipc._startServer();
    if (process.platform !== 'win32') {
      sinon.assert.calledOnceWithExactly(rmSync, 'test', { force: true });
    }
  });

  it('validate handling an error event', () => {
    ipc._name = 'test';
    ipc._clients.push(client1);
    ipc._clients.push(client2);
    serverMock.expects('close').twice();
    serverMock.expects('removeAllListeners').twice();
    client1Mock.expects('stop').once();
    client2Mock.expects('stop').once();

    // No error message, clients available
    ipc._onError(new Error());
    sinon.assert.calledWithExactly(consoleError.getCall(0), '1234567890:ERR:ipc:server:test:');
    expect(ipc._clients.length).to.equal(0);

    // With error message, no clients available
    ipc._onError(new Error('Unknown error'));
    sinon.assert.calledWithExactly(consoleError.getCall(1), '1234567890:ERR:ipc:server:test:Unknown error');

    // Cleanup
    clearTimeout(ipc._retryTimer);
  });

  it('validate handling a connection event', () => {
    // No old clients to be cleaned up
    ipc._onConnection(new net.Socket());
    ipc._onConnection(new net.Socket());
    ipc._onConnection(new net.Socket());
    expect(ipc._clients.length).to.equal(3);

    // Stop only the second client
    ipc._clients[1].stop();

    // Old clients to be cleaned up
    ipc._onConnection(new net.Socket());
    ipc._onConnection(new net.Socket());
    expect(ipc._clients.length).to.equal(4);

    // Cleanup
    for (const client of ipc._clients) {
      client.stop();
    }
  });

  it('validate handling an indication event', () => {
    // No indication callbacks available
    ipc._handleIndication(new IpcMessage('test', 'indication'));

    // Indication callback available
    let indicationName = '';
    let indicationPayload: IpcPayload;
    ipc._indicationCallbacks.push((name, payload) => {
      indicationName = name;
      indicationPayload = payload;
    });
    ipc._handleIndication(new IpcMessage('test1', 'indication'));
    expect(indicationName).to.equal('test1');
    expect(indicationPayload).to.equal(undefined);
    ipc._handleIndication(new IpcMessage('test2', 'indication', { status: true }));
    expect(indicationName).to.equal('test2');
    expect(indicationPayload).to.deep.equal({ status: true });
  });

  it('validate handling a request event', () => {
    const response = () => {
      // Not used
    };

    // No request callbacks available
    ipc._handleRequest(new IpcMessage('test', 'request'), response);

    // Request callback available
    let requestName = '';
    let requestPayload: IpcPayload;
    let requestResponse: ((payload?: IpcPayload) => void) | undefined;
    ipc._requestCallbacks.push((name, payload, response) => {
      requestName = name;
      requestPayload = payload;
      requestResponse = response;
    });
    ipc._handleRequest(new IpcMessage('test1', 'request'), response);
    expect(requestName).to.equal('test1');
    expect(requestPayload).to.equal(undefined);
    expect(requestResponse).to.equal(response);
    ipc._handleRequest(new IpcMessage('test2', 'request', { status: true }), response);
    expect(requestName).to.equal('test2');
    expect(requestPayload).to.deep.equal({ status: true });
    expect(requestResponse).to.equal(response);
  });
});
