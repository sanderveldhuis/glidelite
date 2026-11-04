
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
    const id = setInterval(() => {
      onTimeout();
    }, timeout);
    onTimeout();

    return () => {
      clearInterval(id);
    };
  }, [timeout]);
}

export default useInterval;
```

Now make use of the API, update the following TypeScript code in `frontend/src/App.tsx`:

```typescript
// Import the GlideLite API provider
import { api } from 'glidelite/frontend';
import {
  useEffect,
  useState
} from 'react';
// Import type guard functions
import {
  isCounterMsg,
  isInfoMsg
} from '../../shared/types';
// Import the hook function for cyclic API requests
import useInterval from './hooks/useInterval';

function App() {
  const [count, setCount] = useState(0);
  const [id, setId] = useState(0);
  const [author, setAuthor] = useState('Unknown');
  const [version, setVersion] = useState('Unknown');

  // On startup of the page request the counter value
  useEffect(() => {
    api.get({ path: '/counter', responseType: 'json', timeout: 500 }).then(payload => {
      // Check if the received payload is valid
      if (!isCounterMsg(payload)) {
        throw new Error();
      }
      // Set the value on the screen
      setCount(payload.value);
    });
  }, []);

  // Cyclic request the information
  useInterval(() => {
    api.get({ path: '/', responseType: 'json', timeout: 800 }).then(payload => {
      // Check if the received payload is valid
      if (!isInfoMsg(payload)) {
        throw new Error();
      }
      // Set the values on the screen
      setId(payload.id);
      setAuthor(payload.author);
      setVersion(payload.version);
    });
  }, 1000);

  return (
    <>
      <div style={{'textAlign': 'center'}}>
        <h1>Counter</h1>
        <button
          type='button'
          className='counter'
          onClick={() => {
            // On click update the counter and request the updated counter value
            api.post({ path: '/counter', responseType: 'json', params: { increment: 1 } }).then(() => {
              api.get({ path: '/counter', responseType: 'json', timeout: 500 }).then(payload => {
                // Check if the received payload is valid
                if (!isCounterMsg(payload)) {
                  throw new Error();
                }
                // Set the values on the screen
                setCount(payload.value);
              });
            });
          }}
        >
          <code>Count is {count}</code>
        </button>
      </div>

      <div style={{'textAlign': 'center'}}>
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
