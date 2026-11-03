
# Use Configurations

The `glconfig.json` configuration file can be used to define global configuration values used throughout the project. Besides the predefined [configurations](https://github.com/sanderveldhuis/glidelite/blob/main/doc/configuration.md) it also allows custom configurations.

## Custom configurations

In your editor, type the following JSON in `glconfig.json`:

```json
{
  "author": "John Doe"
}
```

Now make use of this configuration value, update `backend/api/routers/info.ts` with the following TypeScript code:

```typescript
// Import the GlideLite configuration
import { glconfig } from 'glidelite/backend';

...

// Replace the hardcoded string 'Anonymous' by the configuration value
const infoMsg: InfoMsg = {
  id: 0,
  author: glconfig.author,
  version: 'None'
};

...
```

By importing the `glidelite/backend` module, it is possible to directly use the values from the `glconfig.json` via the provided `glconfig` object. The GlideLite Compiler will ensure it is linked correctly.

## Special configurations

Inherited [configurations](https://github.com/sanderveldhuis/glidelite/blob/main/doc/configuration.md) from the `package.json` are only usable in the released version of the project. This can be used to check whether the project runs in development or production mode.

In your editor, update the following TypeScript code in `backend/api/routers/info.ts`:

```typescript
...

// Replace the hardcoded string 'None' by the configuration value
const infoMsg: InfoMsg = {
  id: 0,
  author: glconfig.author,
  version: (glconfig.version ?? 'Develop') as string
};

...
```

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
