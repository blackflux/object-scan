const fs = require('smart-fs');
const path = require('path');
const isEqual = require('lodash.isequal');

const objectScanReleased = require('object-scan');
const objectScanLocal = require('../src/index');

const generateDataset = require('./helper/generate-dataset');
const generateNeedles = require('./helper/generate-needles');
const callSignature = require('./helper/call-signature');
const createHtmlDiff = require('./helper/create-html-diff');

const TEST_COUNT = 100000;

// eslint-disable-next-line no-console
const log = (...args) => console.log(...args);

for (let count = 1; count <= TEST_COUNT; count += 1) {
  const { rng, haystack, paths } = generateDataset();
  const useArraySelector = rng() > 0.2;
  const needles = generateNeedles({
    rng,
    paths,
    useArraySelector,
    modifierParams: (p) => ({
      lenPercentage: rng() > 0.1 ? rng() : 1,
      questionMark: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
      partialStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
      singleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
      doubleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
      exclude: rng() > 0.9,
      shuffle: rng() > 0.9
    })
  });

  const signatureReleased = callSignature({
    objectScan: objectScanReleased,
    haystack,
    needles,
    useArraySelector
  });
  const signatureLocal = callSignature({
    objectScan: objectScanLocal,
    haystack,
    needles,
    useArraySelector
  });
  if (!isEqual(signatureReleased, signatureLocal)) {
    log(`Mismatch for seed: ${rng.seed}`);
    const diff = createHtmlDiff(rng.seed, signatureReleased, signatureLocal);
    fs.smartWrite(path.join(__dirname, '..', 'debug', `${rng.seed}.html`), diff.split('\n'));
  }

  if ((count % 100) === 0) {
    log(`Progress: ${count} / ${TEST_COUNT}`);
  }
}
