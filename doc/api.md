
# API

The purpose of the API is to make communication between the frontend, controlled by the client, and backend simple, consistent, scalable, and secure. The API is a dedicated server on which the client can request data using HTTP methods such as GET, POST, PUT, and DELETE. For API development GlideLite relies on [Express](https://expressjs.com/) as framework.

## Running your code

First, run your project for local development:

```bash
npx glc -r
```

## Build your first router

In your editor, type the following TypeScript code in `backend/api/routers/info.ts`:

```typescript
import express from 'express';

// Construct the Express router
const router = express.Router();

// The router implementation
router.get('/info', (req, res) => {
  res.status(200).json({ user: 'unknown' });
});

export default router;
```

After saving the TypeScript file, you'll notice that the GlideLite Compiler detects the changes and restarts the API server on its default port `9002`. Use your browser to execute a request to the API via the URL `http://localhost:9002/info`

> [!IMPORTANT]
> Routers are always executed in alphanumeric sequence. In case a router should be executed before another make use of file names with numbers in front, e.g.: `01_first.ts`, `02_second.ts`, etc.

## Build your first middleware

In your editor, type the following TypeScript code in `backend/api/middleware/checker.ts`:

```typescript
import express from 'express';

// Construct the Express router
const checker = express.Router();

// The router implementation
checker.use((req, res, next) => {
  console.log('Nothing to check');
  next();
});

export default checker;
```

After saving the TypeScript file, the GlideLite Compiler detects changes and will restart the API server. However, the middleware is not yet used. Let's change this.

In your editor, type the following TypeScript code in `backend/api/routers/info.ts`:

```typescript
import express from 'express';
import checker from '../middleware/checker';

// Construct the Express router
const router = express.Router();

// The router implementation
router.get('/info', checker, (req, res) => {
  res.status(200).json({ user: 'unknown' });
});

export default router;
```

Use your browser to execute a request to the API via the URL `http://localhost:9002/info`. You will see that the middleware is executed and printing a line to the console.

## Use configuration values

The `glconfig.json` configuration file can be used to define global configuration values used throughout the project.

In your editor, type the following JSON in `glconfig.json`:

```json
{
  "user": "John Doe"
}
```

Now make use of this configuration value, update `backend/api/routers/info.ts` with the following TypeScript code:

```typescript
import { glconfig } from 'glidelite';
import express from 'express';
import checker from '../middleware/checker';

// Construct the Express router
const router = express.Router();

// The router implementation
router.get('/info', checker, (req, res) => {
  res.status(200).json({ user: glconfig.user });
});

export default router;
```

By importing the `glidelite` module, it is possible to directly use the values from the `glconfig.json` via the provided `glconfig` object. The GlideLite Compiler will ensure it is linked correctly.

## Use a logger

GlideLite provides a generic logger ensuring uniform output is written to the `/var/log/[project]` directory on the deployment system. These log files are automatically rotated and cleaned up to prevent overflooding the memory. To use a logger you should give it a dedicated name for the application you are working on:

```typescript
log.[name].debug('message');
log.[name].info('message');
log.[name].warn('message');
log.[name].error('message');
```

Let's name your middleware `checker` and update `backend/api/middleware/checker.ts` with the following TypeScript code:

```typescript
import { glconfig, log } from 'glidelite';
import express from 'express';

// Construct the Express router
const checker = express.Router();

// The router implementation
checker.use((req, res, next) => {
  if (glconfig.user && glconfig.user === 'John Doe') {
    log.checker.info('Valid user found:', glconfig.user);
    next();
  } else {
    next(new Error('No valid user found'));
  }
});

export default checker;
```

## Use dependency packages

To use packages as dependency in your TypeScript code, you must list them as `dependencies` or `devDependencies` in your project's `package.json` file.

> [!WARNING]
> Make sure to add the dependencies required in runtime to the `dependencies` attribute and dependencies required only for local development and testing in the `devDependencies` attribute.

In your editor, add the following dependencies to your `package.json`:

```json
{
  "dependencies": {
    "d3-random": "latest"
  },
  "devDependencies": {
    "@types/d3-random": "latest"
  }
}
```

Stop the local development run by pressing `Ctrl+C`, install the newly added dependencies by running `npm install` and use it in the `backend/api/routers/info.ts` TypeScript code:

```typescript
import { randomInt } from 'd3-random';
import { glconfig } from 'glidelite';
import express from 'express';
import checker from '../middleware/checker';

// Construct the Express router
const router = express.Router();

// The router implementation
router.get('/info', checker, (req, res) => {
  res.status(200).json({ user: glconfig.user, id: randomInt(1000)() });
});

export default router;
```
