
# Inter-Process communication

Inter-process communication (IPC) is a mechanism to allow separate modules or processes, such as workers and APIs, to communicate with each other. In GlideLite the maximum payload size of an IPC message is 1MB, if a message exeeds this threshold it will automatically being dropped without error or warning.

## Start and stop IPC

IPC in GlideLite is based on endpoint names, where each module represents its own endpoint for which you can define a name yourself.

```typescript
import { ipc } from 'glidelite';

// Start IPC as name 'myapplication' and connect to 'otherapplication1' and 'otherapplication2'
ipc.start('myapplication', 'otherapplication1', 'otherapplication2');
// Stop IPC
ipc.stop();
```

## Subscribe, unsubscribe, and publish

Publish messages are transmitted asynchronous to all endpoints which are subscribed to that message name. The latest published message for each message name is cached and transmitted to endpoints which are subscribed later in time. Therefor publish messages are always guaranteed to be delivered.

```typescript
import { ipc } from 'glidelite';

// Subscribe on a publish message with name 'hello' to the endpoint with name 'otherapplication1'
ipc.to.otherapplication1?.subscribe('hello', (name, payload) => {
  console.log('Received publish with name:', name, 'payload:', payload);
});

// Unsubscribe from a publish message with name 'hello' to the endpoint with name 'otherapplication1'
ipc.to.otherapplication1?.unsubscribe('hello');

// Publish messages with different datatypes to all subscribed endpoints
ipc.publish('empty_message');
ipc.publish('string_message', 'Hello, World!');
ipc.publish('number_message', 1234);
ipc.publish('boolean_message', true);
ipc.publish('null_message', null);
ipc.publish('object_message', { hello: 'world' });
```

## Indication

Indication messages are transmitted asynchronous to a specified endpoint where the delivery is not guaranteed (fire-and-forget).

```typescript
import { ipc } from 'glidelite';

// Register a callback for handling received indication messages
ipc.onIndication((name, payload) => {
  console.log('Received indication with name:', name, 'payload:', payload);
});

// Send an indication message with different datatypes to the endpoint with name 'otherapplication1'
ipc.to.otherapplication1?.indication('empty_message');
ipc.to.otherapplication1?.indication('string_message', 'Hello, World!');
ipc.to.otherapplication1?.indication('number_message', 1234);
ipc.to.otherapplication1?.indication('boolean_message', true);
ipc.to.otherapplication1?.indication('null_message', null);
ipc.to.otherapplication1?.indication('object_message', { hello: 'world' });
```

## Request and response

Request and response messages are transmitted asynchronous to a specified endpoint where the delivery is not guaranteed and no timeout is set. Once a response is received the specified callback will be invoked. GlideLite supports a maximum of 100 simultaneous open IPC requests.

```typescript
import { ipc } from 'glidelite';

// Register a callback for handling received request messages
ipc.onRequest((name, payload, response) => {
  console.log('Received request with name:', name, 'payload:', payload);
  response({ result: 'successfull' });
});

// Send a request message with different datatypes to the endpoint with name 'otherapplication1'
ipc.to.otherapplication1?.request('empty_message', (name, payload) => {
  console.log('Received response with name:', name, 'payload:', payload);
});
ipc.to.otherapplication1?.request('string_message', 'Hello, World!', (name, payload) => {
  console.log('Received response with name:', name, 'payload:', payload);
});
ipc.to.otherapplication1?.request('number_message', 1234, (name, payload) => {
  console.log('Received response with name:', name, 'payload:', payload);
});
ipc.to.otherapplication1?.request('boolean_message', true, (name, payload) => {
  console.log('Received response with name:', name, 'payload:', payload);
});
ipc.to.otherapplication1?.request('null_message', null, (name, payload) => {
  console.log('Received response with name:', name, 'payload:', payload);
});
ipc.to.otherapplication1?.request('object_message', { hello: 'world' }, (name, payload) => {
  console.log('Received response with name:', name, 'payload:', payload);
});
```
