const { fork } = require('child_process');

const fs = require('smart-fs');
const path = require('path');
const isEqual = require('lodash.isequal');
const { v4: uuid } = require('uuid');

const createHtmlDiff = require('./helper/create-html-diff');

const TEST_COUNT = 100000;

// eslint-disable-next-line no-console
const log = (...args) => console.log(...args);

const Worker = () => {
  const compute = fork('./worker');
  let resolve;
  compute.on('message', (result) => resolve(result));
  return async (seed, useLocal) => {
    const result = new Promise((r) => {
      resolve = r;
    });
    compute.send({ seed, useLocal });
    return result;
  };
};

const execute = async () => {
  let timeReleased = 0;
  let timeLocal = 0;

  const worker1 = Worker();
  const worker2 = Worker();

  for (let count = 1; count <= TEST_COUNT; count += 1) {
    const seed = uuid();

    // eslint-disable-next-line no-await-in-loop
    const signatureLocal = await worker1(seed, true);
    timeLocal += signatureLocal.duration;
    delete signatureLocal.duration;

    // eslint-disable-next-line no-await-in-loop
    const signatureReleased = await worker2(seed, false);
    timeReleased += signatureReleased.duration;
    delete signatureReleased.duration;

    if (!isEqual(signatureReleased, signatureLocal)) {
      log(`Mismatch for seed: ${seed}`);
      const diff = createHtmlDiff(seed, signatureReleased, signatureLocal, {
        haystack: signatureLocal.haystack,
        needles: signatureLocal.needles,
        useArraySelector: signatureLocal.useArraySelector,
        seed
      });
      fs.smartWrite(path.join(__dirname, '..', 'debug', `${seed}.html`), diff.split('\n'));
    }

    if ((count % 100) === 0) {
      const percent = ((timeLocal - timeReleased) * 100.0) / timeReleased;
      log(`Progress: ${count} / ${TEST_COUNT} (${percent > 0 ? '+' : ''}${percent.toFixed(2)}%)`);
    }
  }
};
execute();
