'glc task @daily';

import { ipc } from 'glidelite/backend';

ipc.start('reset', 'api');
ipc.to.api.indication('reset-counter');
ipc.stop();
