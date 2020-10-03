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

describe('Testing bulk related', { timeout: 5 * 60000 }, () => {
  let init;
  beforeEach(() => {
    init = () => {
      const rng = PRNG(`${Math.random()}`);
      const keys = generateKeys(Math.ceil(rng() * 30), rng);
      const haystack = generateHaystack(haystackGenerator({ rng, keys }));
      const paths = extractPathsFromHaystack(haystack);
      const pathsShuffled = [...paths];
      shuffleArray(pathsShuffled, rng);
      return {
        rng, haystack, paths, pathsShuffled
      };
    };
  });

  it('Testing simple matching', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const {
        rng, haystack, paths, pathsShuffled
      } = init();
      const needlePaths = pathsShuffled.map((p) => pathToNeedlePath(p));
      const needles = needlePathsToNeedlesParsed(needlePaths);
      const str = parsedNeedleToString(needles);
      const matches = objectScan(str === null ? [] : [str])(haystack);
      expect(paths, `Seed: ${rng.seed}`).to.deep.equal(matches.reverse());
    }
  });

  it('Testing parameter matching', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const {
        rng, haystack, paths, pathsShuffled
      } = init();
      const needlePaths = pathsShuffled.map((p) => pathToNeedlePath(p, {
        questionMark: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
        partialStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
        singleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
        doubleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1
      }, rng));
      const needles = needlePathsToNeedlesParsed(needlePaths);
      const str = parsedNeedleToString(needles);
      const matches = objectScan(str === null ? [] : [str], { strict: false })(haystack);
      expect(matches, `Seed: ${rng.seed}`).to.include.deep.members(paths);
    }
  });
});
