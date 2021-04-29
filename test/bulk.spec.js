const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateDataset = require('./helper/generate-dataset');
const generateNeedles = require('./helper/generate-needles');
const objectScan = require('../src/index');

const Tester = () => {
  const generateTestSet = ({ useArraySelector, modify }) => {
    const { rng, haystack, paths } = generateDataset();
    const needles = generateNeedles({
      rng,
      paths,
      useArraySelector,
      modifierParams: modify
        ? (p) => ({
          questionMark: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
          partialPlus: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
          partialStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
          singleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
          doublePlus: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
          doubleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1
        })
        : () => {}
    });
    return {
      needles, haystack, rng, paths
    };
  };
  return {
    executeAndTest: ({ useArraySelector, modify }) => {
      const {
        needles, haystack, rng, paths
      } = generateTestSet({ useArraySelector, modify });
      const matches = objectScan(needles, { useArraySelector, strict: !modify })(haystack);
      if (useArraySelector && !modify) {
        expect(matches, `Seed: ${rng.seed}`).to.deep.equal(paths);
      } else {
        expect(matches, `Seed: ${rng.seed}`).to.include.deep.members(paths);
      }
    },
    executeAndTestFnCorrectness: ({ useArraySelector }) => {
      const { needles, haystack, rng } = generateTestSet({ useArraySelector, modify: false });

      const breakMatches = [];
      const breakNonMatches = [];
      const filterMatches = [];

      const breakMatchedKeys = [];
      const breakNonMatchedKeys = [];
      const filterMatchedKeys = [];

      const serialize = ({ result, ...kwargs }) => JSON.stringify(kwargs);

      objectScan(needles, {
        useArraySelector,
        strict: true,
        breakFn: (kwargs) => {
          (kwargs.isMatch ? breakMatches : breakNonMatches).push(serialize(kwargs));
          (kwargs.isMatch ? breakMatchedKeys : breakNonMatchedKeys).push(kwargs.key);
        },
        filterFn: (kwargs) => {
          filterMatches.push(serialize(kwargs));
          filterMatchedKeys.push(kwargs.key);
        },
        joined: true
      })(haystack);

      expect(breakMatches.sort(), `Seed: ${rng.seed}`).to.deep.equal(filterMatches.sort());
      expect(!breakNonMatches.some((e) => filterMatches.includes(e)), `Seed: ${rng.seed}`).to.equal(true);

      expect(breakMatchedKeys.sort(), `Seed: ${rng.seed}`).to.deep.equal(filterMatchedKeys.sort());
      expect(!breakNonMatchedKeys.some((e) => filterMatchedKeys.includes(e)), `Seed: ${rng.seed}`).to.equal(true);
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

  it('Testing breakFn, filterFn correctness (useArraySelector = true)', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      Tester().executeAndTestFnCorrectness({ useArraySelector: true });
    }
  });

  it('Testing breakFn, filterFn correctness (useArraySelector = false)', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      Tester().executeAndTestFnCorrectness({ useArraySelector: false });
    }
  });
});
