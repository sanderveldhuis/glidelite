
# Logging

GlideLite includes a built-in logger for the backend that writes uniform log output to the `/var/log/[project]` directory on your deployment system. These log files are rotated and cleaned up automatically, so they won't fill up your disk.

## Write logs

Give each worker or API a dedicated logger name, then log messages at the level that fits:

```typescript
log.[name].debug('message', params);
log.[name].info('message', params);
log.[name].warn('message', params);
log.[name].error('message', params);
```

Let's name your service worker `heartbeat`. Update `backend/workers/heartbeat.ts` with the following TypeScript code:

```typescript
'glc service';

// Import the GlideLite logger
import { log } from 'glidelite/backend';

const heartbeatTimer = setInterval(() => {
  // Log the heartbeat as debug
  log.heartbeat.debug('Expired');
}, 10000);

process.on('SIGINT', () => {
  // Log the stop message as info
  log.heartbeat.info('Stopped');
  clearInterval(heartbeatTimer);
});

// Log the start message as info
log.heartbeat.info('Started');
```

The `glidelite/backend` module exposes the logger through the `log` object, and the GlideLite Compiler automatically sets up a dedicated logger for your worker.

## Further Reading

Build a more capable backend with GlideLite's [inter-process communication](https://github.com/sanderveldhuis/glidelite/blob/main/doc/ipc.md).
