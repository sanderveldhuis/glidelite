
# WebSocket Communication

GlideLite includes a frontend WebSocket helper that opens the WebSocket to the correct endpoint on the backend. Use it in your user interface, for example in `frontend/src/App.tsx`:

```typescript
import {
  api,
  websocket
} from 'glidelite/frontend';
import {
  useCallback,
  useEffect,
  useRef,
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
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const webSocketRef = useRef<WebSocket | null>(null);

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

  // Function executing WebSocket communication to send a message to the echo endpoint
  const sendMessage = useCallback(() => {
    // Check if the WebSocket is connected and a message is entered
    if (webSocketRef.current?.readyState === WebSocket.OPEN && message.trim()) {
      webSocketRef.current.send(message);
      setMessage('');
    }
  }, [message]);

  // On page load, request the counter value
  useEffect(() => getCounter(), [getCounter]);

  // Request the information each second
  useInterval(() => getInfo(), 1000);

  // On page load, connect the WebSocket to the echo endpoint
  useEffect(() => {
    // Connect and store the WebSocket
    const ws = websocket('/echo');
    webSocketRef.current = ws;

    // Set a received message in the response textarea
    ws.onmessage = event => {
      setResponse(`${event.data}\n${response}`);
    };

    // Cleanup the WebSocket connection
    return () => {
      ws.close();
    };
  }, [response]);

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

      <div style={{ textAlign: 'center' }}>
        <h2>Chat</h2>
        <input
          type='text'
          placeholder='Enter message'
          onChange={e => setMessage(e.target.value)}
          value={message}
        />
        <button
          type='button'
          onClick={() => sendMessage()}
        >
          Send
        </button>
        <div>
          <textarea value={response} readOnly />
        </div>
      </div>
    </>
  );
}

export default App;
```

After saving the files, open `http://localhost:5173/`. Previously, entering a message only updated the response textarea locally in the browser. Now it sends the message through the WebSocket, the endpoint echos the message, and after receiving it in the browser again it is displayed in the response textarea.

## Further Reading

Your project is ready for [deployment](https://github.com/sanderveldhuis/glidelite/blob/main/doc/deployment.md).
