const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateDataset = require('../helper/generate-dataset');

describe('Testing generate-dataset.js', () => {
  it('Testing seed consistency', () => {
    const seed = '2c67f2ed-d237-4831-85ba-4ee21ef9dad8';
    const {
      rng, haystack, paths
    } = generateDataset(seed);
    expect(rng.seed).to.deep.equal(seed);
    expect(haystack).to.deep.equal({});
    expect(paths).to.deep.equal([]);
  });
});
