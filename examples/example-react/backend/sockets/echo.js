import {
  log,
  websocket
} from 'glidelite/backend';

const socket = websocket({
  path: '/echo',
  authorize: _req => {
    return true;
  },
  onConnection: (ws, _req) => {
    log.echo.info('Client connected');

    ws.on('message', (data, isBinary) => {
      ws.send(data, { binary: isBinary });
    });
  }
});

export default socket;
