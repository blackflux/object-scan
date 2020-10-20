const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateDataset = require('./helper/generate-dataset');
const generateNeedles = require('./helper/generate-needles');
const objectScan = require('../src/index');

const Tester = () => ({
  executeAndTest: ({ useArraySelector, modify }) => {
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
    const matches = objectScan(needles, { useArraySelector, strict: !modify })(haystack);
    if (useArraySelector && !modify) {
      expect(matches, `Seed: ${rng.seed}`).to.deep.equal(paths);
    } else {
      expect(matches, `Seed: ${rng.seed}`).to.include.deep.members(paths);
    }
  }
});

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
