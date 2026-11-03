
# Logging

GlideLite provides a generic logger for the backend ensuring uniform output is written to the `/var/log/[project]` directory on the deployment system. These log files are automatically rotated and cleaned up to prevent overflooding the memory.

## Write logs

To use a logger you should give it a dedicated name for the worker or API you are working on:

```typescript
log.[name].debug('message', params);
log.[name].info('message', params);
log.[name].warn('message', params);
log.[name].error('message', params);
```

Let's name your service worker `heartbeat` and update `backend/workers/heartbeat.ts` with the following TypeScript code:

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

The imported `glidelite/backend` module contains the logger via the provided `log` object. The GlideLite Compiler will ensure a new logger is initiated for your worker.

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
