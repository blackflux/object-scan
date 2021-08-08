const { fork } = require('child_process');

const fs = require('smart-fs');
const path = require('path');
const isEqual = require('lodash.isequal');

const generateDataset = require('./helper/generate-dataset');
const generateNeedles = require('./helper/generate-needles');
const createHtmlDiff = require('./helper/create-html-diff');

const TEST_COUNT = 1000000;

// eslint-disable-next-line no-console
const log = (...args) => console.log(...args);

const Worker = () => {
  const compute = fork(path.join(__dirname, 'worker.js'));
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

  const worker1 = Worker();
  const worker2 = Worker();

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
      modifierParams: (p) => ({
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
        haystack,
        needles,
        useArraySelector,
        reverse,
        orderByNeedles,
        seed: rng.seed
      });
      fs.smartWrite(path.join(__dirname, '..', 'debug', `${rng.seed}.html`), diff.split('\n'));
    }

    if ((count % 100) === 0) {
      log(`Progress: ${count} / ${TEST_COUNT} (${timeReleased.diff(timeLocal)})`);
    }
  }
  worker1.exit();
  worker2.exit();
};
execute();
