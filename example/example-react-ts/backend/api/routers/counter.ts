import express from 'express';
import { ipc, log } from 'glidelite/backend';
import { CounterMsg } from '../../../shared/types.js';

const counterMsg: CounterMsg = { value: 0 };

ipc.onIndication((name, _payload) => {
  if (name === 'reset-counter') {
    counterMsg.value = 0;
    log.counter.info('Reset');
  }
});

const router = express.Router();

router.get('/counter', (req, res) => {
  res.status(200).json(counterMsg);
});

router.post('/counter', (req, res, _next) => {
  counterMsg.value += req.body.increment;
  res.status(201).end();
});

export default router;
