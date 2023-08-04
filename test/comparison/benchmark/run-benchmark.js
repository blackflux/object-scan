import { fork } from 'child_process';
import { join } from 'path';
import fs from 'smart-fs';

const Worker = async () => {
  const compute = fork(join(fs.dirname(import.meta.url), 'worker.js'));
  await new Promise((resolve) => {
    // waiting for worker to be ready
    compute.on('message', () => resolve());
  });
  let resolve;
  compute.on('message', (result) => resolve(result));
  return {
    exec: async (kwargs) => {
      const result = new Promise((r) => {
        resolve = r;
      });
      compute.send(kwargs);
      return result;
    },
    exit: () => {
      compute.send('exit');
    }
  };
};

export default async (suite, test, fixture) => {
  const worker = await Worker();
  const r = await worker.exec({ suite, test, fixture });
  worker.exit();
  return r;
};
