import { describe } from 'node-tdd';
import { expect } from 'chai';
import generateDataset from './helper/generate-dataset.js';
import generateNeedles from './helper/generate-needles.js';
import objectScan from '../src/index.js';

const Tester = (seed = null) => {
  const generateTestSet = ({ useArraySelector, modify }) => {
    const { rng, haystack, paths } = generateDataset(seed);
    const needles = generateNeedles({
      rng,
      paths,
      useArraySelector,
      pathModifierParams: modify
        ? (p) => ({
          questionMark: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
          partialPlus: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
          partialStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
          singleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
          doublePlus: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
          doubleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1
        })
        : () => {},
      groupModifierParams: modify
        ? () => ({
          anyRecGroup: rng() > 0.2 ? 0 : rng(),
          doublePlusGroup: 0,
          doubleStarGroup: rng() > 0.2 ? 0 : rng()
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
