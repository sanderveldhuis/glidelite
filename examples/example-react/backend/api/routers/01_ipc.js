import { ipc } from 'glidelite/backend';

ipc.start('api');

process.on('SIGINT', () => {
  ipc.stop();
});
