import express from 'express';
import { randomInt } from 'd3-random';
import { glconfig } from 'glidelite/backend';

const infoMsg = {
  id: 0,
  author: glconfig.author,
  version: glconfig.version ?? 'Develop'
};

const router = express.Router();

router.get('/', (req, res) => {
  infoMsg.id = randomInt(1000)();
  res.status(200).json(infoMsg);
});

export default router;
