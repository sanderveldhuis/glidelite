import { api } from 'glidelite/frontend';
import {
  useEffect,
  useState
} from 'react';
import {
  isCounterMsg,
  isInfoMsg
} from '../../shared/types';
import useInterval from './hooks/useInterval';

function App() {
  const [count, setCount] = useState(0);
  const [id, setId] = useState(0);
  const [author, setAuthor] = useState('Unknown');
  const [version, setVersion] = useState('Unknown');

  useEffect(() => {
    api.get({ path: '/counter', responseType: 'json', timeout: 500 }).then(payload => {
      if (!isCounterMsg(payload)) {
        throw new Error();
      }
      setCount(payload.value);
    });
  }, []);

  useInterval(() => {
    api.get({ path: '/', responseType: 'json', timeout: 800 }).then(payload => {
      if (!isInfoMsg(payload)) {
        throw new Error();
      }
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
            api.post({ path: '/counter', responseType: 'json', params: { increment: 1 } }).then(() => {
              api.get({ path: '/counter', responseType: 'json', timeout: 500 }).then(payload => {
                if (!isCounterMsg(payload)) {
                  throw new Error();
                }
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
