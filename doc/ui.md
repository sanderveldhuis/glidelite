
# User Interface

For frontend development GlideLite relies on [Vite](https://vite.dev/) as builder. When initializing a new project, by default GlideLite uses (but is not limited to) [React](https://react.dev/) as library to create interactive and dynamic user interfaces.

All frontend code development should be made in the `frontend` directory. Feel free to update your `Vite` configuration at `frontend/vite.config.ts` as desired.

## Build your first user interface

This user interface will make use of React as library. In your editor, add the following dependencies to your `package.json`:

```json
{
  "dependencies": {
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  },
  "devDependencies": {
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0"
  }
}
```

Stop the local development run by pressing `Ctrl+C`, install the newly added dependencies by running `npm install` and restart your project:

```bash
npx glc -r
```

In your editor, type the following TypeScript code in `frontend/src/App.tsx`:

```typescript
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [id, setId] = useState(0);
  const [author, setAuthor] = useState('Unknown');
  const [version, setVersion] = useState('Unknown');

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <h1>Counter</h1>
        <button
          type='button'
          onClick={() => setCount((count) => count + 1)}
        >
          <code>Count is {count}</code>
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2>Information</h2>
        <div>Random ID: {id}</div>
        <div>Author: {author}</div>
        <div>Version: {version}</div>
      </div>
    </>
  );
}

export default App;
```

For now this `App` is not yet used so type the following TypeScript code in `frontend/src/main.tsx`:

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

As last step, update the `frontend/index.html`:

```html
...

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>

...
```

After saving the TypeScript files, you'll notice that Vite automatically restarts the served website. Use your browser to open the URL `http://localhost:5173/`.

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
