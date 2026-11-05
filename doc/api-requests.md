
# API Requests

GlideLite provides a frontend API request helper ensuring easy access to the backend API is provided.

First, write a hook function which will be used for cyclic API requests. In your editor, type the following TypeScript code in `frontend/src/hooks/useInterval.ts`:

```typescript
import {
  useEffect,
  useEffectEvent
} from 'react';

function useInterval(handler: () => void, timeout: number) {
  const onTimeout = useEffectEvent(handler);

  useEffect(() => {
    const id = setInterval(() => onTimeout(), timeout);
    onTimeout();

    return () => clearInterval(id);
  }, [timeout]);
}

export default useInterval;
```

Now make use of the API, update the following TypeScript code in `frontend/src/App.tsx`:

```typescript
import { api } from 'glidelite/frontend';
import {
  useCallback,
  useEffect,
  useState
} from 'react';
import {
  isCounterMsg,
  isInfoMsg
} from '../../shared/types.ts';
import useInterval from './hooks/useInterval.ts';

function App() {
  const [count, setCount] = useState(0);
  const [id, setId] = useState(0);
  const [author, setAuthor] = useState('Unknown');
  const [version, setVersion] = useState('Unknown');

  // Function executing API request to get the information
  const getInfo = useCallback(() => {
    api.get({ path: '/', responseType: 'json', timeout: 800 }).then(payload => {
      // Check if the received payload is valid
      if (!isInfoMsg(payload)) {
        throw new Error();
      }
      setId(payload.id);
      setAuthor(payload.author);
      setVersion(payload.version);
    });
  }, []);

  // Function executing API request to get the counter value
  const getCounter = useCallback(() => {
    api.get({ path: '/counter', responseType: 'json', timeout: 500 }).then(payload => {
      // Check if the received payload is valid
      if (!isCounterMsg(payload)) {
        throw new Error();
      }
      setCount(payload.value);
    });
  }, []);

  // Function executing API request to increment the counter value
  const incrementCounter = useCallback(() => {
    api.post({ path: '/counter', responseType: 'json', params: { increment: 1 } }).then(() => {
      getCounter();
    });
  }, [getCounter]);

  // On load request the counter value
  useEffect(() => getCounter(), [getCounter]);

  // Request the information each second
  useInterval(() => getInfo(), 1000);

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <h1>Counter</h1>
        <button
          type='button'
          onClick={() => incrementCounter()}
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

After saving the TypeScript files, use your browser to open the URL `http://localhost:5173/`. Previously, when clicking on the counter button it incremented the value locally in the browser. After this change it is updated in the API and a refresh of the page will not clean the value as it is stored remotely. Next to that the information is requested each second which is easily seen due to the random ID.

# Further Reading

The project is ready for [deployment](https://github.com/sanderveldhuis/glidelite/blob/main/doc/deployment.md) for the public.
