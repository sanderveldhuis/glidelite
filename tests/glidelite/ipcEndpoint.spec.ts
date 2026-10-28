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

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';
import { IpcEndpointImpl } from '../../src/glidelite/backend/ipcEndpoint';
import {
  IpcMessage,
  IpcPayload
} from '../../src/glidelite/backend/ipcMessage';

describe('ipcEndpoint.ts', () => {
  let endpoint: IpcEndpointImpl;

  beforeEach(() => {
    endpoint = new IpcEndpointImpl('test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validate starting an IPC endpoint', () => {
    // @ts-expect-error because function has return type Socket
    const socketOn = vi.spyOn(endpoint._socket, 'on').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type Socket
    const socketConnect = vi.spyOn(endpoint._socket, 'connect').mockImplementation(() => {/*Emtpy*/});

    expect(endpoint._running).to.equal(false);
    expect(endpoint._retryTimer).to.equal(undefined);
    endpoint.start();
    expect(socketOn).toHaveBeenCalledTimes(5);
    expect(socketOn).toHaveBeenNthCalledWith(1, 'connect', expect.anything());
    expect(socketOn).toHaveBeenNthCalledWith(2, 'end', expect.anything());
    expect(socketOn).toHaveBeenNthCalledWith(3, 'error', expect.anything());
    expect(socketOn).toHaveBeenNthCalledWith(4, 'close', expect.anything());
    expect(socketOn).toHaveBeenNthCalledWith(5, 'data', expect.anything());
    expect(socketConnect).toHaveBeenCalledTimes(1);
    expect(socketConnect).toHaveBeenLastCalledWith(endpoint._path);
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
      expect(endpoint._path).to.match(/^.*\/ipc_test$/);
    }
  });

  it('validate stopping an IPC endpoint', () => {
    // @ts-expect-error because function has return type Socket
    const socketEnd = vi.spyOn(endpoint._socket, 'end').mockImplementation(() => {/*Emtpy*/});

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

    endpoint.stop();
    expect(socketEnd).toHaveBeenCalledTimes(1);
    expect(socketEnd).toHaveBeenLastCalledWith();
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
      expect(endpoint._path).to.match(/^.*\/ipc_test$/);
    }
  });

  it('validate indication message', () => {
    const socketWrite = vi.spyOn(endpoint._socket, 'write').mockImplementation(() => {
      return true;
    });

    endpoint.indication('test1');
    expect(socketWrite).toHaveBeenCalledTimes(1);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test1","type":"indication"}[GLE]');

    endpoint.indication('test2', { result: true });
    expect(socketWrite).toHaveBeenCalledTimes(2);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test2","type":"indication","payload":{"result":true}}[GLE]');
  });

  it('validate request message', () => {
    const socketWrite = vi.spyOn(endpoint._socket, 'write').mockImplementation(() => {
      return true;
    });

    endpoint.request('test1', undefined, () => {
      // Nothing to do
    });
    expect(socketWrite).toHaveBeenCalledTimes(1);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test1","type":"request","session":1}[GLE]');
    expect(endpoint._requests[0]).to.not.equal(undefined);
    expect(endpoint._requests[1]).to.equal(undefined);
    expect(endpoint._requests[98]).to.equal(undefined);
    expect(endpoint._requests[99]).to.equal(undefined);
    expect(endpoint._session).to.equal(2);

    endpoint.request('test2', { result: true }, () => {
      // Nothing to do
    });
    expect(socketWrite).toHaveBeenCalledTimes(2);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test2","type":"request","session":2,"payload":{"result":true}}[GLE]');
    expect(endpoint._requests[0]).to.not.equal(undefined);
    expect(endpoint._requests[1]).to.not.equal(undefined);
    expect(endpoint._requests[98]).to.equal(undefined);
    expect(endpoint._requests[99]).to.equal(undefined);
    expect(endpoint._session).to.equal(3);

    // Restarting session number after 100
    endpoint._session = 99;
    endpoint.request('test3', undefined, () => {
      // Nothing to do
    });
    expect(socketWrite).toHaveBeenCalledTimes(3);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test3","type":"request","session":99}[GLE]');
    expect(endpoint._requests[0]).to.not.equal(undefined);
    expect(endpoint._requests[1]).to.not.equal(undefined);
    expect(endpoint._requests[98]).to.not.equal(undefined);
    expect(endpoint._requests[99]).to.equal(undefined);
    expect(endpoint._session).to.equal(100);

    endpoint.request('test4', undefined, () => {
      // Nothing to do
    });
    expect(socketWrite).toHaveBeenCalledTimes(4);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test4","type":"request","session":100}[GLE]');
    expect(endpoint._requests[0]).to.not.equal(undefined);
    expect(endpoint._requests[1]).to.not.equal(undefined);
    expect(endpoint._requests[98]).to.not.equal(undefined);
    expect(endpoint._requests[99]).to.not.equal(undefined);
    expect(endpoint._session).to.equal(1);
  });

  it('validate subscribe message', () => {
    const socketWrite = vi.spyOn(endpoint._socket, 'write').mockImplementation(() => {
      return true;
    });

    endpoint.subscribe('test1', () => {
      // Nothing to do
    });
    expect(socketWrite).toHaveBeenCalledTimes(1);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test1","type":"subscribe"}[GLE]');
    expect(Object.keys(endpoint._subscriptions).length).to.equal(1);
    expect(endpoint._subscriptions.test1).to.not.equal(undefined);
    expect(endpoint._subscriptions.test2).to.equal(undefined);

    endpoint.subscribe('test2', () => {
      // Nothing to do
    });
    expect(socketWrite).toHaveBeenCalledTimes(2);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test2","type":"subscribe"}[GLE]');
    expect(Object.keys(endpoint._subscriptions).length).to.equal(2);
    expect(endpoint._subscriptions.test1).to.not.equal(undefined);
    expect(endpoint._subscriptions.test2).to.not.equal(undefined);

    endpoint.subscribe('test1', () => {
      // Nothing to do
    });
    expect(socketWrite).toHaveBeenCalledTimes(3);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test1","type":"subscribe"}[GLE]');
    expect(Object.keys(endpoint._subscriptions).length).to.equal(2);
    expect(endpoint._subscriptions.test1).to.not.equal(undefined);
    expect(endpoint._subscriptions.test2).to.not.equal(undefined);
  });

  it('validate unsubscribe message', () => {
    const socketWrite = vi.spyOn(endpoint._socket, 'write').mockImplementation(() => {
      return true;
    });

    endpoint._subscriptions.test1 = () => {
      // Nothing to do
    };
    endpoint._subscriptions.test2 = () => {
      // Nothing to do
    };

    endpoint.unsubscribe('test1');
    expect(socketWrite).toHaveBeenCalledTimes(1);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test1","type":"unsubscribe"}[GLE]');
    expect(Object.keys(endpoint._subscriptions).length).to.equal(1);
    expect(endpoint._subscriptions.test1).to.equal(undefined);
    expect(endpoint._subscriptions.test2).to.not.equal(undefined);

    endpoint.unsubscribe('test2');
    expect(socketWrite).toHaveBeenCalledTimes(2);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test2","type":"unsubscribe"}[GLE]');
    expect(Object.keys(endpoint._subscriptions).length).to.equal(0);
    expect(endpoint._subscriptions.test1).to.equal(undefined);
    expect(endpoint._subscriptions.test2).to.equal(undefined);

    endpoint.unsubscribe('test1');
    expect(socketWrite).toHaveBeenCalledTimes(3);
    expect(socketWrite).toHaveBeenLastCalledWith('[GLS]{"name":"test1","type":"unsubscribe"}[GLE]');
    expect(Object.keys(endpoint._subscriptions).length).to.equal(0);
    expect(endpoint._subscriptions.test1).to.equal(undefined);
    expect(endpoint._subscriptions.test2).to.equal(undefined);
  });

  it('validate handling a connected event', () => {
    const socketWrite = vi.spyOn(endpoint._socket, 'write').mockImplementation(() => {
      return true;
    });

    // No subscriptions available
    endpoint._onConnected();
    expect(socketWrite).toHaveBeenCalledTimes(0);

    // Subscriptions available
    endpoint._subscriptions.test1 = () => {
      // Nothing to do
    };
    endpoint._subscriptions.test2 = () => {
      // Nothing to do
    };
    endpoint._onConnected();
    expect(socketWrite).toHaveBeenCalledTimes(2);
    expect(socketWrite).toHaveBeenNthCalledWith(1, '[GLS]{"name":"test1","type":"subscribe"}[GLE]');
    expect(socketWrite).toHaveBeenNthCalledWith(2, '[GLS]{"name":"test2","type":"subscribe"}[GLE]');
  });

  it('validate handling an end event', () => {
    // @ts-expect-error because function has return type Socket
    const socketEnd = vi.spyOn(endpoint._socket, 'end').mockImplementation(() => {/*Empty*/});

    endpoint._onEnd();
    expect(socketEnd).toHaveBeenCalledTimes(1);
    expect(socketEnd).toHaveBeenLastCalledWith();
  });

  it('validate handling an error event', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type Socket
    const socketDestroy = vi.spyOn(endpoint._socket, 'destroy').mockImplementation(() => {/*Empty*/});
    vi.spyOn(Date, 'now').mockImplementation(() => {
      return 1234567890;
    });

    // No error message
    endpoint._onError(new Error());
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('1234567890:ERR:ipc:endpoint:test:');
    expect(socketDestroy).toHaveBeenCalledTimes(1);
    expect(socketDestroy).toHaveBeenLastCalledWith();

    // With ignored error message
    endpoint._onError(new Error('Unknown ENOENT error'));
    expect(socketDestroy).toHaveBeenCalledTimes(2);
    expect(socketDestroy).toHaveBeenLastCalledWith();

    // With error message
    endpoint._onError(new Error('Unknown error'));
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenLastCalledWith('1234567890:ERR:ipc:endpoint:test:Unknown error');
    expect(socketDestroy).toHaveBeenCalledTimes(3);
    expect(socketDestroy).toHaveBeenLastCalledWith();
  });

  it('validate handling a close event', () => {
    // @ts-expect-error because function has return type Socket
    const socketDestroy = vi.spyOn(endpoint._socket, 'destroy').mockImplementation(() => {/*Empty*/});
    // @ts-expect-error because function has return type Socket
    const socketRemoveAllListeners = vi.spyOn(endpoint._socket, 'removeAllListeners').mockImplementation(() => {/*Empty*/});

    // Not running
    endpoint._onClose();
    expect(socketDestroy).toHaveBeenCalledTimes(1);
    expect(socketDestroy).toHaveBeenLastCalledWith();
    expect(socketRemoveAllListeners).toHaveBeenCalledTimes(1);
    expect(socketRemoveAllListeners).toHaveBeenLastCalledWith();
    expect(endpoint._retryTimer).to.equal(undefined);

    // Running
    endpoint._running = true;
    endpoint._onClose();
    expect(socketDestroy).toHaveBeenCalledTimes(2);
    expect(socketDestroy).toHaveBeenLastCalledWith();
    expect(socketRemoveAllListeners).toHaveBeenCalledTimes(2);
    expect(socketRemoveAllListeners).toHaveBeenLastCalledWith();
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
    let publishPayload: IpcPayload;
    endpoint._subscriptions.test = (name, payload) => {
      publishName = name;
      publishPayload = payload;
    };
    endpoint._onData(Buffer.from('[GLS]{"name":"test","type":"publish","payload":true}[GLE]'));
    expect(publishName).to.equal('test');
    expect(publishPayload).to.equal(true);

    // Response message
    let requestName = '';
    let requestPayload: IpcPayload;
    endpoint._requests[99] = (name, payload) => {
      requestName = name;
      requestPayload = payload;
    };
    endpoint._onData(Buffer.from('[GLS]{"name":"test","type":"response","payload":true,"session":100}[GLE]'));
    expect(requestName).to.equal('test');
    expect(requestPayload).to.equal(true);
    expect(endpoint._requests[99]).to.equal(undefined);
  });

  it('validate handling a publish', () => {
    // No registered callbacks
    endpoint._onPublish(new IpcMessage('test1', 'publish'));

    // Registered callbacks but not for the specified name
    let publishName = '';
    let publishPayload: IpcPayload;
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
    endpoint._onResponse(new IpcMessage('test', 'response', undefined, 100));

    // Session number out of bounds should not cause an error
    endpoint._onResponse(new IpcMessage('test', 'response', undefined, 101));
    endpoint._onResponse(new IpcMessage('test', 'response', undefined, 0));

    // Registered callback but not for session number
    let requestName = '';
    let requestPayload: IpcPayload;
    endpoint._requests[98] = (name, payload) => {
      requestName = name;
      requestPayload = payload;
    };
    endpoint._requests[97] = (name, payload) => {
      requestName = name;
      requestPayload = payload;
    };
    endpoint._onResponse(new IpcMessage('test1', 'response', undefined, 100));
    expect(requestName).to.equal('');
    expect(requestPayload).to.equal(undefined);
    expect(endpoint._requests[97]).to.not.equal(undefined);
    expect(endpoint._requests[98]).to.not.equal(undefined);

    // Registered callback for session number
    endpoint._onResponse(new IpcMessage('test2', 'response', undefined, 99));
    expect(requestName).to.equal('test2');
    expect(requestPayload).to.equal(undefined);
    expect(endpoint._requests[97]).to.not.equal(undefined);
    expect(endpoint._requests[98]).to.equal(undefined);
    endpoint._onResponse(new IpcMessage('test3', 'response', { result: true }, 98));
    expect(requestName).to.equal('test3');
    expect(requestPayload).to.deep.equal({ result: true });
    expect(endpoint._requests[97]).to.equal(undefined);
    expect(endpoint._requests[98]).to.equal(undefined);
  });
});
