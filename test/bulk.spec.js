const expect = require('chai').expect;
const { describe } = require('node-tdd');
const PRNG = require('./helper/prng');
const shuffleArray = require('./helper/shuffle-array');
const haystackGenerator = require('./helper/haystack-generator');
const generateKeys = require('./helper/generate-keys');
const generateHaystack = require('./helper/generate-haystack');
const extractPathsFromHaystack = require('./helper/extract-paths-from-haystack');
const needlePathsToNeedlesParsed = require('./helper/needle-paths-to-needles-parsed');
const pathToNeedlePath = require('./helper/path-to-needle-path');
const parsedNeedleToString = require('./helper/parsed-needle-to-string');
const objectScan = require('../src/index');

const init = () => {
  const rng = PRNG(`${Math.random()}`);
  const keys = generateKeys(Math.ceil(rng() * 30), rng);
  const haystack = generateHaystack(haystackGenerator({ rng, keys }));
  const paths = extractPathsFromHaystack(haystack);
  const pathsShuffled = [...paths];
  shuffleArray(pathsShuffled, rng);
  const pathsFilteredRaw = pathsShuffled
    .map((p) => p.filter((k) => !Number.isInteger(k)))
    .filter((p) => p.length !== 0);
  const pathsFiltered = pathsFilteredRaw
    .filter((p, i) => pathsFilteredRaw
      .findIndex((e) => e.length === p.length && e.every((s, j) => s === p[j])) === i);
  return {
    rng, haystack, paths, pathsShuffled, pathsFiltered
  };
};

const genParam = (rng, len) => ({
  questionMark: rng() > 0.2 ? 0 : Math.floor(rng() * len) + 1,
  partialStar: rng() > 0.2 ? 0 : Math.floor(rng() * len) + 1,
  singleStar: rng() > 0.2 ? 0 : Math.floor(rng() * len) + 1,
  doubleStar: rng() > 0.2 ? 0 : Math.floor(rng() * len) + 1
});

describe('Testing bulk related', { timeout: 5 * 60000 }, () => {
  it('Testing with useArraySelector', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const {
        rng, haystack, paths, pathsShuffled
      } = init();
      const needlePaths = pathsShuffled.map((p) => pathToNeedlePath(p));
      const needles = needlePathsToNeedlesParsed(needlePaths);
      const str = parsedNeedleToString(needles);
      const needleArray = str === null ? [] : [str];
      const matches = objectScan(needleArray)(haystack);
      expect(paths, `Seed: ${rng.seed}`).to.deep.equal(matches.reverse());
    }
  });

  it('Testing without useArraySelector', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const {
        rng, haystack, paths, pathsFiltered
      } = init();
      const needlePaths = pathsFiltered.map((p) => pathToNeedlePath(p));
      const needles = needlePathsToNeedlesParsed(needlePaths);
      const str = parsedNeedleToString(needles);
      const needleArray = str === null ? [''] : [str, ''];
      const matches = objectScan(needleArray, { useArraySelector: false })(haystack);
      expect(matches, `Seed: ${rng.seed}`).to.include.deep.members(paths);
    }
  });

  it('Testing with useArraySelector and modifications', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const {
        rng, haystack, paths, pathsShuffled
      } = init();
      const needlePaths = pathsShuffled.map((p) => pathToNeedlePath(p, genParam(rng, p.length), rng));
      const needles = needlePathsToNeedlesParsed(needlePaths);
      const str = parsedNeedleToString(needles);
      const matches = objectScan(str === null ? [] : [str], { strict: false })(haystack);
      expect(matches, `Seed: ${rng.seed}`).to.include.deep.members(paths);
    }
  });

  it('Testing without useArraySelector and modifications', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const {
        rng, haystack, paths, pathsFiltered
      } = init();
      const needlePaths = pathsFiltered
        .map((p) => pathToNeedlePath(p, genParam(rng, p.length), rng));
      const needles = needlePathsToNeedlesParsed(needlePaths);
      const str = parsedNeedleToString(needles);
      const matches = objectScan(str === null ? [''] : [str, ''], {
        useArraySelector: false,
        strict: false
      })(haystack);
      expect(matches, `Seed: ${rng.seed}`).to.include.deep.members(paths);
    }
  });
});
