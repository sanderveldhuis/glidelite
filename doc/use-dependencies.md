
# Use Dependencies

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

Restart the local development run to test it again. You will should see the random ID in the API response.

# Further Reading

Use [logging](https://github.com/sanderveldhuis/glidelite/blob/main/doc/logging.md) to files for inspection and analysis of your GlideLite project.
