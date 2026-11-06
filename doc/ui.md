
# User Interface

GlideLite uses [Vite](https://vite.dev/) to build the frontend. New projects are set up with [React](https://react.dev/) by default to help you build interactive, dynamic user interfaces — though you're not limited to React alone.

All frontend code lives in the `frontend` directory. Feel free to adjust the Vite configuration in `frontend/vite.config.ts` as needed.

## Build your first user interface

This interface uses React. In your editor, add the following dependencies to your `package.json`:

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

Stop the local development run (`Ctrl+C`), install the new dependencies with `npm install`, and restart your project:

```bash
npx glc -r
```

In your editor, add the following TypeScript code to `frontend/src/App.tsx`:

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

This `App` component isn't used anywhere yet, so add the following TypeScript code to `frontend/src/main.tsx`:

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

Finally, update `frontend/index.html`:

```html
...

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>

...
```

After saving the files, Vite automatically reloads the page. Open your browser at `http://localhost:5173/` to see it in action.

## Further Reading

Learn how to make simple, safe [API requests](https://github.com/sanderveldhuis/glidelite/blob/main/doc/api-requests.md) from your user interface to the backend.
