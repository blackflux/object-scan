const expect = require('chai').expect;
const { describe } = require('node-tdd');
const PRNG = require('./helper/prng');
const shuffleArray = require('./helper/shuffle-array');
const haystackGenerator = require('./helper/haystack-generator');
const generateHaystack = require('./helper/generate-haystack');
const extractPathsFromHaystack = require('./helper/extract-paths-from-haystack');
const needlePathsToNeedlesParsed = require('./helper/needle-paths-to-needles-parsed');
const pathToNeedlePath = require('./helper/path-to-needle-path');
const parsedNeedleToString = require('./helper/parsed-needle-to-string');
const objectScan = require('../src/index');

describe('Testing bulk related', () => {
  it('Testing all needles matched', () => {
    for (let idx = 0; idx < 100; idx += 1) {
      const seed = `${Math.random()}`;
      const rng = PRNG(seed);
      const haystack = generateHaystack(haystackGenerator({ rng }));
      const paths = extractPathsFromHaystack(haystack);
      const pathsShuffled = [...paths];
      shuffleArray(pathsShuffled, rng);
      const needlePaths = pathsShuffled.map((p) => pathToNeedlePath(p));
      const needles = needlePathsToNeedlesParsed(needlePaths);
      const str = parsedNeedleToString(needles);
      const matches = objectScan(str === null ? [] : [str])(haystack);
      expect(paths, `Seed: ${seed}`).to.deep.equal(matches.reverse());
    }
  });
});
