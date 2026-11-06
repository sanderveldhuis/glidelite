
# Inter-Process Communication

Inter-process communication (IPC) lets backend modules — such as workers and APIs — talk to each other. In GlideLite, an IPC message can't be larger than 1MB; larger messages are dropped silently, without any error or warning.

## Start and stop IPC

IPC in GlideLite is based on endpoint names. Each worker or API is an endpoint, and you give it a name when you start IPC.

```typescript
import { ipc } from 'glidelite/backend';

// Start IPC as name 'myapplication' and connect to 'otherapplication1' and 'otherapplication2' to be able to send messages to the endpoints
ipc.start('myapplication', 'otherapplication1', 'otherapplication2');
// Stop IPC
ipc.stop();
```

## Subscribe, unsubscribe, and publish

Publish messages are sent asynchronously to every endpoint subscribed to that message name. GlideLite caches the latest published message for each name and delivers it to endpoints that subscribe later — so publish messages are always guaranteed to arrive eventually.

```typescript
import { ipc } from 'glidelite/backend';

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

Indication messages are sent asynchronously to a single endpoint as a fire-and-forget message — delivery isn't guaranteed.

```typescript
import { ipc } from 'glidelite/backend';

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

Request and response messages are sent asynchronously to a single endpoint. Delivery isn't guaranteed, and there's no default timeout for requests. When a response arrives, the callback you provided is invoked. GlideLite limits the number of simultaneous open requests to 100 — once that limit is reached, the oldest pending request is dropped.

```typescript
import { ipc } from 'glidelite/backend';

// Register a callback for handling received request messages
ipc.onRequest((name, payload, response) => {
  console.log('Received request with name:', name, 'payload:', payload);
  response({ result: 'successful' });
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

## Resetting the counter

Let's use an IPC indication to reset the counter of the worker created in [previous steps](https://github.com/sanderveldhuis/glidelite/blob/main/doc/workers.md). In your editor, add the following TypeScript code to `backend/workers/reset.ts`:

```typescript
'glc task @daily';

// Import the GlideLite IPC layer
import { ipc } from 'glidelite/backend';

// Start IPC as name 'reset' and connect to 'api' to be able to send messages to the endpoint
ipc.start('reset', 'api');

// Send an indication to reset the counter
ipc.to.api.indication('reset-counter');

// Stop IPC
ipc.stop();
```

The `api` endpoint doesn't exist yet. Add the following TypeScript code to `backend/api/routers/01_ipc.ts`:

```typescript
// Import the GlideLite IPC layer
import { ipc } from 'glidelite/backend';

// Start IPC as name 'api'
ipc.start('api');

// Stop IPC on interrupt
process.on('SIGINT', () => {
  ipc.stop();
});
```

This starts IPC whenever the API server starts. Next, handle the incoming indication and reset the counter. Add the following TypeScript code to `backend/api/routers/counter.ts`:

```typescript
// Import the GlideLite IPC layer
import { ipc, log } from 'glidelite/backend';

...

// Handle the reset counter indication
ipc.onIndication((name, _payload) => {
  if (name === 'reset-counter') {
    counterMsg.value = 0;
    log.counter.info('Reset');
  }
});

...
```

In production, this task runs once a day. To test it right now, run:

```bash
npx ts-node ./backend/workers/reset.ts
```

## Further Reading

Continue your journey and start coding your first [user interface](https://github.com/sanderveldhuis/glidelite/blob/main/doc/ui.md).
