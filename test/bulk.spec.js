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
const stripArraySelectorFromPaths = require('./helper/strip-array-selector-from-paths');
const objectScan = require('../src/index');

const Tester = () => {
  const generateData = () => {
    const rng = PRNG(`${Math.random()}`);
    const keys = generateKeys(Math.ceil(rng() * 30), rng);
    const haystack = generateHaystack(haystackGenerator({ rng, keys }));
    const paths = extractPathsFromHaystack(haystack);
    return { rng, haystack, paths };
  };
  const mkNeedles = ({
    rng, paths, useArraySelector, modify
  }) => {
    const needlePathParams = (p) => (modify ? {
      questionMark: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
      partialStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
      singleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
      doubleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1
    } : {});

    const needles = useArraySelector ? paths : stripArraySelectorFromPaths(paths);
    const needlesShuffled = shuffleArray(needles, rng);
    const needlePaths = needlesShuffled.map((p) => pathToNeedlePath(p, needlePathParams(p), rng));
    const needlesParsed = needlePathsToNeedlesParsed(needlePaths);
    return parsedNeedleToStringArray(needlesParsed);
  };

  return {
    executeAndTest: ({ useArraySelector, modify }) => {
      const { rng, haystack, paths } = generateData();
      const needles = mkNeedles({
        rng, paths, useArraySelector, modify
      });
      const matches = objectScan(needles, { useArraySelector, strict: !modify })(haystack);
      if (useArraySelector && !modify) {
        expect(matches, `Seed: ${rng.seed}`).to.deep.equal(paths);
      } else {
        expect(matches, `Seed: ${rng.seed}`).to.include.deep.members(paths);
      }
    }
  };
};

describe('Testing bulk related', { timeout: 5 * 60000 }, () => {
  it('Testing with useArraySelector', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      Tester().executeAndTest({ useArraySelector: true, modify: false });
    }
  });

  it('Testing without useArraySelector', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      Tester().executeAndTest({ useArraySelector: false, modify: false });
    }
  });

  it('Testing with useArraySelector and modifications', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      Tester().executeAndTest({ useArraySelector: true, modify: true });
    }
  });

  it('Testing without useArraySelector and modifications', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      Tester().executeAndTest({ useArraySelector: false, modify: true });
    }
  });
});
