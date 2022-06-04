import { fork } from 'child_process';

import fs from 'smart-fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import isEqual from 'lodash.isequal';

import generateDataset from './helper/generate-dataset.js';
import generateNeedles from './helper/generate-needles.js';
import createHtmlDiff from './helper/create-html-diff.js';

const TEST_COUNT = 1000000;

// eslint-disable-next-line no-console
const log = (...args) => console.log(...args);

const Worker = async () => {
  const compute = fork(join(dirname(fileURLToPath(import.meta.url)), 'worker.js'));
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

const Time = () => {
  const data = {
    compile: 0,
    traverse: 0
  };
  return {
    add: (duration) => {
      Object.keys(data).forEach((k) => {
        data[k] += duration[k];
      });
    },
    get: (k) => data[k],
    diff: (time) => Object.keys(data).map((k) => {
      const percent = ((time.get(k) - data[k]) * 100.0) / data[k];
      return `${k}: ${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
    }).join(', ')
  };
};

const execute = async () => {
  const timeReleased = Time();
  const timeLocal = Time();

  const worker1 = await Worker();
  const worker2 = await Worker();

  for (let count = 1; count <= TEST_COUNT; count += 1) {
    const { rng, haystack, paths } = generateDataset();
    const useArraySelector = rng() > 0.2;
    const reverse = rng() > 0.5;
    const orderByNeedles = rng() > 0.9;
    const needles = generateNeedles({
      rng,
      paths,
      useArraySelector,
      reverse,
      orderByNeedles,
      pathModifierParams: (p) => ({
        lenPercentage: rng() > 0.1 ? rng() : 1,
        questionMark: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        partialPlus: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        partialStar: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        singleStar: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        doublePlus: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        doubleStar: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        regex: rng() > 0.1 ? 0 : Math.floor(rng() * p.length) + 1,
        exclude: rng() > 0.9,
        shuffle: rng() > 0.9
      }),
      groupModifierParams: () => ({
        // todo: uncomment
        doublePlusGroup: 0, // rng() > 0.2 ? 0 : rng(),
        doubleStarGroup: 0 // rng() > 0.2 ? 0 : rng()
      })
    });

    const kwargs = {
      haystack,
      needles,
      useArraySelector,
      reverse,
      orderByNeedles
    };
    // eslint-disable-next-line no-await-in-loop
    const [signatureLocal, signatureReleased] = await Promise.all([
      worker1.exec({ ...kwargs, useLocal: true }),
      worker2.exec({ ...kwargs, useLocal: false })
    ]);
    timeLocal.add(signatureLocal.duration);
    timeReleased.add(signatureReleased.duration);
    delete signatureLocal.duration;
    delete signatureReleased.duration;

    if (!isEqual(signatureReleased, signatureLocal)) {
      log(`Mismatch for seed: ${rng.seed}`);
      const diff = createHtmlDiff(rng.seed, signatureReleased, signatureLocal, {
        kwargs,
        seed: rng.seed
      });
      fs.smartWrite(
        join(dirname(fileURLToPath(import.meta.url)), '..', 'debug', `${rng.seed}.html`),
        diff.split('\n')
      );
    }

    if ((count % 100) === 0) {
      log(`Progress: ${count} / ${TEST_COUNT} (${timeReleased.diff(timeLocal)})`);
    }
  }
  worker1.exit();
  worker2.exit();
};
execute();
