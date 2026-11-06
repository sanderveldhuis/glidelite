
# Using Configuration Values

The `glconfig.json` file isn't limited to the predefined [configuration](https://github.com/sanderveldhuis/glidelite/blob/main/doc/configuration.md) values — you can also use it to define your own custom, project-wide configuration values.

## Custom configuration values

In your editor, add the following JSON to `glconfig.json`:

```json
{
  "author": "John Doe"
}
```

Now use this value. Update `backend/api/routers/info.ts` with the following TypeScript code:

```typescript
// Import the GlideLite configuration
import { glconfig } from 'glidelite/backend';

...

// Replace the hardcoded string 'Anonymous' with the configuration value
const infoMsg: InfoMsg = {
  id: 0,
  author: glconfig.author,
  version: 'None'
};

...
```

Importing the `glidelite/backend` module gives you direct access to the values from `glconfig.json` via the `glconfig` object. The GlideLite Compiler wires this up for you automatically.

## Values inherited from `package.json`

Values [inherited](https://github.com/sanderveldhuis/glidelite/blob/main/doc/configuration.md) from `package.json`, such as `version`, are only available in the released version of your project. You can use this to detect whether your code is running in development or production.

In your editor, update `backend/api/routers/info.ts` with the following TypeScript code:

```typescript
...

// Replace the hardcoded string 'None' with the configuration value
const infoMsg: InfoMsg = {
  id: 0,
  author: glconfig.author,
  version: (glconfig.version ?? 'Develop') as string
};

...
```

## Further Reading

Get even more out of GlideLite and learn how to [use dependencies](https://github.com/sanderveldhuis/glidelite/blob/main/doc/use-dependencies.md) in your code.
