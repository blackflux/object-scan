const objectScanReleased = require('object-scan');
const objectScanLocal = require('../src/index');

const generateDataset = require('./helper/generate-dataset');
const generateNeedles = require('./helper/generate-needles');
const callSignature = require('./helper/call-signature');

process.on('message', ({ seed, useLocal }) => {
  const { rng, haystack, paths } = generateDataset(seed);
  const useArraySelector = rng() > 0.2;
  const needles = generateNeedles({
    rng,
    paths,
    useArraySelector,
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
  const result = callSignature({
    objectScan: useLocal ? objectScanLocal : objectScanReleased,
    haystack,
    needles,
    useArraySelector
  });
  process.send(result);
});
