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
const parsedNeedleToStringArray = require('./helper/parsed-needle-to-string-array');
const objectScan = require('../src/index');

const Tester = () => {
  const rng = PRNG(`${Math.random()}`);
  const keys = generateKeys(Math.ceil(rng() * 30), rng);
  const haystack = generateHaystack(haystackGenerator({ rng, keys }));
  const paths = extractPathsFromHaystack(haystack);
  const withoutArraySelector = () => {
    const pathsFiltered = paths
      .map((p) => p.filter((k) => !Number.isInteger(k)));
    return pathsFiltered
      .filter((p, i) => pathsFiltered
        .findIndex((e) => e.length === p.length && e.every((s, j) => s === p[j])) === i);
  };

  return {
    rng,
    keys,
    haystack,
    paths,
    needles: ({ useArraySelector = true, modify = false }) => {
      const needles = shuffleArray(
        useArraySelector ? paths : withoutArraySelector(),
        rng
      ).map((p) => pathToNeedlePath(p, modify ? {
        questionMark: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
        partialStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
        singleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
        doubleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1
      } : {}, rng));
      const needlesParsed = needlePathsToNeedlesParsed(needles);
      const result = parsedNeedleToStringArray(needlesParsed);
      // todo: can we improve this (??)
      if (!useArraySelector && !result.includes('')) {
        result.push('');
      }
      return result;
    }
  };
};

describe('Testing bulk related', { timeout: 5 * 60000 }, () => {
  it('Testing with useArraySelector', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const tester = Tester();
      const needles = tester.needles({ useArraySelector: true, modify: false });
      const matches = objectScan(needles)(tester.haystack);
      expect(tester.paths, `Seed: ${tester.rng.seed}`).to.deep.equal(matches.reverse());
    }
  });

  it('Testing without useArraySelector', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const tester = Tester();
      const needles = tester.needles({ useArraySelector: false, modify: false });
      const matches = objectScan(needles, { useArraySelector: false })(tester.haystack);
      expect(matches, `Seed: ${tester.rng.seed}`).to.include.deep.members(tester.paths);
    }
  });

  it('Testing with useArraySelector and modifications', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const tester = Tester();
      const needles = tester.needles({ useArraySelector: true, modify: true });
      const matches = objectScan(needles, { strict: false })(tester.haystack);
      expect(matches, `Seed: ${tester.rng.seed}`).to.include.deep.members(tester.paths);
    }
  });

  it('Testing without useArraySelector and modifications', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const tester = Tester();
      const needles = tester.needles({ useArraySelector: false, modify: true });
      const matches = objectScan(needles, {
        useArraySelector: false,
        strict: false
      })(tester.haystack);
      expect(matches, `Seed: ${tester.rng.seed}`).to.include.deep.members(tester.paths);
    }
  });
});
