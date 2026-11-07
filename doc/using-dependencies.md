
# Using Dependencies

To use a package in your TypeScript code, list it as a `dependencies` or `devDependencies` entry in your project's `package.json`.

> [!WARNING]
> Add packages required at runtime to `dependencies`, and packages only needed for local development and testing to `devDependencies`.

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

Stop the local development run (`Ctrl+C`), install the new dependencies with `npm install`, and use the package in `backend/api/routers/info.ts`:

```typescript
// Import the dependency function
import { randomInt } from 'd3-random';

...

// Set the ID on each request using the dependency function
router.get('/', (req, res) => {
  infoMsg.id = randomInt(1000)();
  res.status(200).json(infoMsg);
});

...
```

Restart the local development run and visit `http://localhost:9002/` again — you should see a random ID in the API response.

## Further Reading

Next, learn how to use [logging](https://github.com/sanderveldhuis/glidelite/blob/main/doc/logging.md) to inspect and analyze your GlideLite project.
