
# API

The API makes communication between the frontend (the client) and the backend simple, consistent, scalable, and secure. It runs as its own server, and the client talks to it over HTTP using methods like GET, POST, PUT, and DELETE. GlideLite uses [Express](https://expressjs.com/) as its API framework.

## Run your code

First, run your project for local development:

```bash
npx glc -r
```

## Build your first router

You'll create an API endpoint that returns system information. This involves two things: a shared message type, and the router that serves it.

In your editor, add the following TypeScript code to `shared/types.ts`:

```typescript
// The info message interface definition
export interface InfoMsg {
  id: number;
  author: string;
  version: string;
}

// Type guard function serving as a validator and type predicate
export function isInfoMsg(payload: object | null): payload is InfoMsg {
  return payload !== null &&
    'id' in payload && typeof payload.id === 'number' &&
    'author' in payload && typeof payload.author === 'string' &&
    'version' in payload && typeof payload.version === 'string';
}
```

Next, add the following TypeScript code to `backend/api/routers/info.ts`:

```typescript
import express from 'express';
import { InfoMsg } from '../../../shared/types';

// Construct the info message
const infoMsg: InfoMsg = {
  id: 0,
  author: 'Anonymous',
  version: 'None'
};

// Construct the Express router
const router = express.Router();

// The router implementation
router.get('/', (req, res) => {
  res.status(200).json(infoMsg);
});

export default router;
```

After saving the file, the GlideLite Compiler detects the change and restarts the API server on its default port, `9002`. Open your browser and visit `http://localhost:9002/` to see the response.

## Use another HTTP method

Let's use the POST method to update a counter. Add the following TypeScript code to `shared/types.ts`:

```typescript
// The counter message interface definition
export interface CounterMsg {
  value: number;
}

// Type guard function serving as a validator with type predicate
export function isCounterMsg(payload: object | null): payload is CounterMsg {
  return payload !== null &&
    'value' in payload && typeof payload.value === 'number';
}
```

Next, add the following TypeScript code to `backend/api/routers/counter.ts`:

```typescript
import express from 'express';
import { CounterMsg } from '../../../shared/types';

// Construct the counter message
const counterMsg: CounterMsg = { value: 0 };

// Construct the Express router
const router = express.Router();

// The router implementation to get the value
router.get('/counter', (req, res) => {
  res.status(200).json(counterMsg);
});

// The router implementation to update the value
router.post('/counter', (req, res, _next) => {
  counterMsg.value += req.body.increment;
  res.status(201).end();
});

export default router;
```

After saving the file, wait for the GlideLite Compiler to restart the API server, then visit `http://localhost:9002/counter` in your browser.

If you try to make a POST request now, the API server logs an error saying it can't read the `increment` property. That's because it doesn't yet know how to parse the request body — the next step fixes that.

## Router execution order

> [!IMPORTANT]
> Routers always run in alphanumeric order. If one router needs to run before another, prefix the file names with numbers, e.g. `01_first.ts`, `02_second.ts`, etc.

The counter router needs to read the `increment` property from the request body. Add the following TypeScript code to `backend/api/routers/00_plugins.ts`:

```typescript
import express from 'express';

// Construct the Express router
const router = express.Router();

// The router plugin to be executed before all other routers
router.use(express.json());

export default router;
```

Now the POST request should work and increment the counter value.

## Advanced Express

To learn more about Express and middleware, see the [Express documentation](https://expressjs.com/).

## Further Reading

Continue your journey and start coding your first [worker](https://github.com/sanderveldhuis/glidelite/blob/main/doc/workers.md).
