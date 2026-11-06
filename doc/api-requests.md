
# API Requests

GlideLite includes a frontend API request helper that makes it easy to talk to your backend API.

First, write a hook that lets you poll data at a fixed interval. In your editor, add the following TypeScript code to `frontend/src/hooks/useInterval.ts`:

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

Now put the API to use. Update `frontend/src/App.tsx` with the following TypeScript code:

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

After saving the files, open `http://localhost:5173/`. Previously, clicking the counter button only updated the value locally in the browser. Now it updates the value through the API, so refreshing the page won't reset it. You'll also notice the information updates every second — the random ID makes this easy to spot.

## Further Reading

Your project is ready for [deployment](./deployment.md).
