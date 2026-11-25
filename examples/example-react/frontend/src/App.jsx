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
} from '../../shared/types.js';
import useInterval from './hooks/useInterval.js';

function App() {
  const [count, setCount] = useState(0);
  const [id, setId] = useState(0);
  const [author, setAuthor] = useState('Unknown');
  const [version, setVersion] = useState('Unknown');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const webSocketRef = useRef(null);

  const getInfo = useCallback(() => {
    api.get({ path: '/', responseType: 'json', timeout: 800 }).then(payload => {
      if (!isInfoMsg(payload)) {
        throw new Error();
      }
      setId(payload.id);
      setAuthor(payload.author);
      setVersion(payload.version);
    });
  }, []);

  const getCounter = useCallback(() => {
    api.get({ path: '/counter', responseType: 'json', timeout: 500 }).then(payload => {
      if (!isCounterMsg(payload)) {
        throw new Error();
      }
      setCount(payload.value);
    });
  }, []);

  const incrementCounter = useCallback(() => {
    api.post({ path: '/counter', responseType: 'json', params: { increment: 1 } }).then(() => {
      getCounter();
    });
  }, [getCounter]);

  const sendMessage = useCallback(() => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN && message.trim()) {
      webSocketRef.current.send(message);
      setMessage('');
    }
  }, [message]);

  useEffect(() => getCounter(), [getCounter]);
  useInterval(() => getInfo(), 1000);
  useEffect(() => {
    const ws = websocket('/echo');
    webSocketRef.current = ws;

    ws.onmessage = event => {
      setResponse(`${event.data}\n${response}`);
    };

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
