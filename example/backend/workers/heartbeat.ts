'glc service';

import { log } from 'glidelite/backend';

const heartbeatTimer = setInterval(() => {
  log.heartbeat.debug('Expired');
}, 10000);

process.on('SIGINT', () => {
  log.heartbeat.info('Stopped');
  clearInterval(heartbeatTimer);
});

log.heartbeat.info('Started');
