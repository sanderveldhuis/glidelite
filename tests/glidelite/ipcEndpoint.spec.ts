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
import sinon from 'ts-sinon';
import { IpcEndpointImpl } from '../../src/glidelite/ipcEndpoint';
import {
  IpcMessage,
  IpcPayload
} from '../../src/glidelite/ipcMessage';

describe('ipcEndpoint.ts', () => {
  let endpoint: IpcEndpointImpl;
  let socketMock: sinon.SinonMock;
  let consoleError: sinon.SinonStub;

  beforeEach(() => {
    endpoint = new IpcEndpointImpl('test');
    socketMock = sinon.mock(endpoint._socket);
    consoleError = sinon.stub(console, 'error');
  });

  afterEach(() => {
    socketMock.verify();
    consoleError.restore();
  });

  it('validate starting an IPC endpoint', () => {
    expect(endpoint._running).to.equal(false);
    expect(endpoint._retryTimer).to.equal(undefined);

    socketMock.expects('on').once().withArgs('connect');
    socketMock.expects('on').once().withArgs('end');
    socketMock.expects('on').once().withArgs('error');
    socketMock.expects('on').once().withArgs('close');
    socketMock.expects('on').once().withArgs('data');
    socketMock.expects('connect').once().withArgs(endpoint._path);
    endpoint.start();

    expect(endpoint._name).to.equal('test');
    expect(endpoint._socket).to.not.equal(undefined);
    expect(endpoint._buffer).to.not.equal(undefined);
    expect(Object.keys(endpoint._subscriptions).length).to.equal(0);
    expect(endpoint._requests.length).to.equal(100);
    expect(endpoint._requests[0]).to.equal(undefined);
    expect(endpoint._session).to.equal(1);
    expect(endpoint._running).to.equal(true);
    expect(endpoint._retryTimer).to.equal(undefined);
    if ('win32' === process.platform) {
      expect(endpoint._path).to.match(new RegExp(/^\\\\\.\\pipe\\.*\\test$/));
    }
    else {
      expect(endpoint._path).to.equal(/^.*\/ipc_test$/);
    }
  });

  it('validate stopping an IPC endpoint', () => {
    endpoint._running = true;
    endpoint._retryTimer = setTimeout(() => {
      // Should not happen
    }, 1000);
    endpoint._subscriptions.test = () => {
      // Not used
    };
    endpoint._requests[0] = () => {
      // Not used
    };

    socketMock.expects('end').once();
    endpoint.stop();

    expect(endpoint._name).to.equal('test');
    expect(endpoint._socket).to.not.equal(undefined);
    expect(endpoint._buffer).to.not.equal(undefined);
    expect(Object.keys(endpoint._subscriptions).length).to.equal(0);
    expect(endpoint._requests.length).to.equal(100);
    expect(endpoint._requests[0]).to.equal(undefined);
    expect(endpoint._session).to.equal(1);
    expect(endpoint._running).to.equal(false);
    expect(endpoint._retryTimer).to.not.equal(undefined);
    if ('win32' === process.platform) {
      expect(endpoint._path).to.match(new RegExp(/^\\\\\.\\pipe\\.*\\test$/));
    }
    else {
      expect(endpoint._path).to.equal(/^.*\/ipc_test$/);
    }
  });

  it('validate indication message', () => {
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test1","type":"indication"}[GLE]');
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test2","type":"indication","payload":{"result":true}}[GLE]');
    endpoint.indication('test1');
    endpoint.indication('test2', { result: true });
  });

  it('validate request message', () => {
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test1","type":"request","session":1}[GLE]');
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test2","type":"request","session":2,"payload":{"result":true}}[GLE]');
    endpoint.request('test1', undefined, () => {
      // Nothing to do
    });
    expect(endpoint._requests[0]).to.not.equal(undefined);
    expect(endpoint._requests[1]).to.equal(undefined);
    endpoint.request('test2', { result: true }, () => {
      // Nothing to do
    });
    expect(endpoint._requests[0]).to.not.equal(undefined);
    expect(endpoint._requests[1]).to.not.equal(undefined);
    expect(endpoint._session).to.equal(3);

    // Restarting session number after 100
    endpoint._session = 99;
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test3","type":"request","session":99}[GLE]');
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test4","type":"request","session":100}[GLE]');
    endpoint.request('test3', undefined, () => {
      // Nothing to do
    });
    endpoint.request('test4', undefined, () => {
      // Nothing to do
    });
    expect(endpoint._requests[0]).to.not.equal(undefined);
    expect(endpoint._requests[1]).to.not.equal(undefined);
    expect(endpoint._requests[98]).to.not.equal(undefined);
    expect(endpoint._requests[99]).to.not.equal(undefined);
    expect(endpoint._session).to.equal(1);
  });

  it('validate subscribe message', () => {
    socketMock.expects('write').twice().withExactArgs('[GLS]{"name":"test1","type":"subscribe"}[GLE]');
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test2","type":"subscribe"}[GLE]');
    endpoint.subscribe('test1', () => {
      // Nothing to do
    });
    endpoint.subscribe('test2', () => {
      // Nothing to do
    });
    endpoint.subscribe('test1', () => {
      // Nothing to do
    });
    expect(Object.keys(endpoint._subscriptions).length).to.equal(2);
    expect(endpoint._subscriptions.test1).to.not.equal(undefined);
    expect(endpoint._subscriptions.test2).to.not.equal(undefined);
  });

  it('validate unsubscribe message', () => {
    socketMock.expects('write').twice().withExactArgs('[GLS]{"name":"test1","type":"unsubscribe"}[GLE]');
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test2","type":"unsubscribe"}[GLE]');
    endpoint._subscriptions.test1 = () => {
      // Nothing to do
    };
    endpoint._subscriptions.test2 = () => {
      // Nothing to do
    };
    endpoint.unsubscribe('test1');
    endpoint.unsubscribe('test2');
    endpoint.unsubscribe('test1');
    expect(Object.keys(endpoint._subscriptions).length).to.equal(0);
    expect(endpoint._subscriptions.test1).to.equal(undefined);
    expect(endpoint._subscriptions.test2).to.equal(undefined);
  });

  it('validate handling a connected event', () => {
    // No subscriptions available
    endpoint._onConnected();

    // Subscriptions available
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test1","type":"subscribe"}[GLE]');
    socketMock.expects('write').once().withExactArgs('[GLS]{"name":"test2","type":"subscribe"}[GLE]');
    endpoint._subscriptions.test1 = () => {
      // Nothing to do
    };
    endpoint._subscriptions.test2 = () => {
      // Nothing to do
    };
    endpoint._onConnected();
  });

  it('validate handling an end event', () => {
    socketMock.expects('end').once();
    endpoint._onEnd();
  });

  it('validate handling an error event', () => {
    socketMock.expects('destroy').thrice();

    // No error message
    endpoint._onError(new Error());
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'ERR:ipc:endpoint:test:');

    // With ignored error message
    endpoint._onError(new Error('Unknown ENOENT error'));

    // With error message
    endpoint._onError(new Error('Unknown error'));
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'ERR:ipc:endpoint:test:Unknown error');
  });

  it('validate handling a close event', () => {
    socketMock.expects('destroy').twice();
    socketMock.expects('removeAllListeners').twice();

    // Not running
    endpoint._onClose();
    expect(endpoint._retryTimer).to.equal(undefined);

    // Running
    endpoint._running = true;
    endpoint._onClose();
    expect(endpoint._retryTimer).to.not.equal(undefined);

    // Cleanup
    clearTimeout(endpoint._retryTimer);
  });

  it('validate handling a data event', () => {
    // In this test we will not validate the buffer itself because it is tested in another test file

    // Message types which should not be handled
    endpoint._onData(Buffer.from('[GLS]{"name":"test","type":"subscribe"}[GLE]'));
    endpoint._onData(Buffer.from('[GLS]{"name":"test","type":"unsubscribe"}[GLE]'));
    endpoint._onData(Buffer.from('[GLS]{"name":"test","type":"indication"}[GLE]'));
    endpoint._onData(Buffer.from('[GLS]{"name":"test","type":"request"}[GLE]'));

    // Publish message
    let publishName = '';
    let publishPayload: IpcPayload | undefined;
    endpoint._subscriptions.test = (name, payload) => {
      publishName = name;
      publishPayload = payload;
    };
    endpoint._onData(Buffer.from('[GLS]{"name":"test","type":"publish","payload":true}[GLE]'));
    expect(publishName).to.equal('test');
    expect(publishPayload).to.equal(true);

    // Response message
    let requestName = '';
    let requestPayload: IpcPayload | undefined;
    endpoint._requests[99] = (name, payload) => {
      requestName = name;
      requestPayload = payload;
    };
    endpoint._onData(Buffer.from('[GLS]{"name":"test","type":"response","payload":true,"session":99}[GLE]'));
    expect(requestName).to.equal('test');
    expect(requestPayload).to.equal(true);
    expect(endpoint._requests[99]).to.equal(undefined);
  });

  it('validate handling a publish', () => {
    // No registered callbacks
    endpoint._onPublish(new IpcMessage('test1', 'publish'));

    // Registered callbacks but not for the specified name
    let publishName = '';
    let publishPayload: IpcPayload | undefined;
    endpoint._subscriptions.test2 = (name, payload) => {
      publishName = name;
      publishPayload = payload;
    };
    endpoint._onPublish(new IpcMessage('test1', 'publish'));
    expect(publishName).to.equal('');
    expect(publishPayload).to.equal(undefined);

    // Registered callback for the specified name
    endpoint._onPublish(new IpcMessage('test2', 'publish'));
    expect(publishName).to.equal('test2');
    expect(publishPayload).to.equal(undefined);
    endpoint._onPublish(new IpcMessage('test2', 'publish', { result: true }));
    expect(publishName).to.equal('test2');
    expect(publishPayload).to.deep.equal({ result: true });
  });

  it('validate handling a response', () => {
    // No session number
    endpoint._onResponse(new IpcMessage('test', 'response'));

    // No registered callback for session number
    endpoint._onResponse(new IpcMessage('test', 'response', undefined, 99));

    // Session number out of bounds should not cause an error
    endpoint._onResponse(new IpcMessage('test', 'response', undefined, 100));
    endpoint._onResponse(new IpcMessage('test', 'response', undefined, -1));

    // Registered callback but not for session number
    let requestName = '';
    let requestPayload: IpcPayload | undefined;
    endpoint._requests[98] = (name, payload) => {
      requestName = name;
      requestPayload = payload;
    };
    endpoint._requests[97] = (name, payload) => {
      requestName = name;
      requestPayload = payload;
    };
    endpoint._onResponse(new IpcMessage('test1', 'response', undefined, 99));
    expect(requestName).to.equal('');
    expect(requestPayload).to.equal(undefined);
    expect(endpoint._requests[97]).to.not.equal(undefined);
    expect(endpoint._requests[98]).to.not.equal(undefined);

    // Registered callback for session number
    endpoint._onResponse(new IpcMessage('test2', 'response', undefined, 98));
    expect(requestName).to.equal('test2');
    expect(requestPayload).to.equal(undefined);
    expect(endpoint._requests[97]).to.not.equal(undefined);
    expect(endpoint._requests[98]).to.equal(undefined);
    endpoint._onResponse(new IpcMessage('test3', 'response', { result: true }, 97));
    expect(requestName).to.equal('test3');
    expect(requestPayload).to.deep.equal({ result: true });
    expect(endpoint._requests[97]).to.equal(undefined);
    expect(endpoint._requests[98]).to.equal(undefined);
  });
});
