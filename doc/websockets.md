
# WebSockets

WebSockets give your frontend a real-time, two-way communication to the backend, for example to build a live feed, a chat, or a multiplayer game. All WebSockets run in a single server and the client talks to it using the [WebSockets API](https://developer.mozilla.org/docs/Web/API/WebSockets_API). GlideLite uses [ws](https://github.com/websockets/ws/) as its WebSocket framework.

## Run your code

First, run your project for local development:

```bash
npx glc -r
```

## Build your first WebSocket

This example creates a chat server which echos messages. Add the following TypeScript code to `backend/sockets/echo.ts`:

```typescript
// Import the GlideLite WebSocket layer
import { websocket } from 'glidelite/backend';

// Construct the WebSocket endpoint
const socket = websocket({
  path: '/echo',
  authorize: _req => {
    // Checked on each connecting client, eg. used to validate tokens
    return true;
  },
  onConnection: (ws, _req) => {
    // Log on each connected client
    console.log('Client connected');

    // Echo every message back to the client
    ws.on('message', (data, isBinary) => {
      ws.send(data, { binary: isBinary });
    });
  }
});

export default socket;
```

After saving the file, the GlideLite Compiler detects the change and restarts the WebSocket server on its default port, `9003`. Open your browser and visit `ws://localhost:9003/echo` to see the communication.

## Further Reading

Continue your journey and start coding your first [worker](https://github.com/sanderveldhuis/glidelite/blob/main/doc/workers.md).
