
# API

The purpose of the API is to make communication between the frontend, controlled by the client, and backend simple, consistent, scalable, and secure. The API is a dedicated server on which the client can request data using HTTP methods such as GET, POST, PUT, and DELETE. For API development GlideLite relies on [Express](https://expressjs.com/) as framework.

## Running your code

First, run your project for local development:

```bash
npx glc -r
```

## Build your first router

In this first router you will create an API endpoint to get system information. This step consists of the message interface definition and the actual API router.

In your editor, type the following TypeScript code in `shared/types.ts`:

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

Next, type the following TypeScript code in `backend/api/routers/info.ts`:

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

After saving the TypeScript file, you'll notice that the GlideLite Compiler detects the changes and restarts the API server on its default port `9002`. Use your browser to execute a request to the API via the URL `http://localhost:9002/`.

## Use another HTTP method

Let's make use of the POST method to update a counter. In your editor, add the following TypeScript code in `shared/types.ts`:

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

Next, type the following TypeScript code in `backend/api/routers/counter.ts`:

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

After saving the TypeScript file, wait for the GlideLite Compiler to restarts the API server. Use your browser to execute a request to the API via the URL `http://localhost:9002/counter`.

Once you try to make a POST request to the URL you will see an error message in the API server indicating it is not able to read the `increment` property. This is because it is not yet able to parse parameters in the request. In the next section this will be resolved.

## Router execution sequence

> [!IMPORTANT]
> Routers are always executed in alphanumeric sequence. In case a router should be executed before another make use of file names with numbers in front, e.g.: `01_first.ts`, `02_second.ts`, etc.

The counter update router of the previous section needs the ability to read the `increment` property from the request JSON.

In your editor, type the following TypeScript code in `backend/api/routers/00_plugins.ts`:

```typescript
import express from 'express';

// Construct the Express router
const router = express.Router();

// The router plugin to be executed before all other routers
router.use(express.json());

export default router;
```

## Advanced Express

To dive deeper in Express please refer to the [Express documentation](https://expressjs.com/) for advanced examples such as Middlewares.

# Further Reading

Continue your journey into GlideLite:

* [Configuration](https://github.com/sanderveldhuis/glidelite/blob/main/doc/configuration.md)
* Backend
  * [API](https://github.com/sanderveldhuis/glidelite/blob/main/doc/api.md)
  * [Workers](https://github.com/sanderveldhuis/glidelite/blob/main/doc/workers.md)
  * [Use configurations](https://github.com/sanderveldhuis/glidelite/blob/main/doc/use-configurations.md)
  * [Use dependencies](https://github.com/sanderveldhuis/glidelite/blob/main/doc/use-dependencies.md)
  * [Logging](https://github.com/sanderveldhuis/glidelite/blob/main/doc/logging.md)
  * [Inter-process communication](https://github.com/sanderveldhuis/glidelite/blob/main/doc/ipc.md)
* Frontend
  * [User interface](https://github.com/sanderveldhuis/glidelite/blob/main/doc/ui.md)
  * [API requests](https://github.com/sanderveldhuis/glidelite/blob/main/doc/api-requests.md)
* [Deployment](https://github.com/sanderveldhuis/glidelite/blob/main/doc/deployment.md)
