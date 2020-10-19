const expect = require('chai').expect;
const { describe } = require('node-tdd');
const sampleArrayGrouped = require('../helper/sample-array-grouped');
const PRNG = require('../helper/prng');

describe('Testing sample-array-grouped.js', () => {
  it('Testing example', () => {
    const rng = PRNG('6e6c38f1-2506-4335-9f96-a71bf96613d4');
    expect(sampleArrayGrouped([1, 2, 3, 4, 5, 6, 7], 3, { rng, unique: true }))
      .to.deep.equal([[6, 1], [5, 1], [1, 1]]);
  });

  it('Testing overflow', () => {
    const rng = PRNG('a6398352-1f0f-4ade-9ea8-874b13c9d99a');
    expect(sampleArrayGrouped([1, 2, 3, 4, 5, 6, 7], 14, { rng, unique: true }))
      .to.deep.equal([[7, 2], [6, 2], [5, 2], [4, 2], [3, 2], [2, 2], [1, 2]]);
  });

  it('Testing overflow not unique', () => {
    const rng = PRNG('a6398352-1f0f-4ade-9ea8-874b13c9d99a');
    expect(sampleArrayGrouped([1, 2, 3, 4, 5, 6, 7], 14, { rng }))
      .to.deep.equal([[7, 1], [5, 6], [4, 3], [2, 2], [1, 2]]);
  });

  it('Testing single entry', () => {
    expect(sampleArrayGrouped([1], 2)).to.deep.equal([[1, 2]]);
  });
});
