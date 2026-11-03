
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
