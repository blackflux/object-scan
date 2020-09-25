const expect = require('chai').expect;
const { describe } = require('node-tdd');
const sampleArray = require('../helper/sample-array');
const PRNG = require('../helper/prng');

describe('Testing sample-array.js', () => {
  it('Testing example', () => {
    const rng = PRNG('6e6c38f1-2506-4335-9f96-a71bf96613d4');
    expect(sampleArray([1, 2, 3, 4, 5, 6, 7], 3, rng)).to.deep.equal([6, 5, 1]);
  });

  it('Testing overflow', () => {
    const rng = PRNG('a6398352-1f0f-4ade-9ea8-874b13c9d99a');
    expect(sampleArray([1, 2, 3, 4, 5, 6, 7], 14, rng))
      .to.deep.equal([
        7, 4, 5, 3, 1, 2, 6,
        5, 3, 4, 6, 2, 1, 7
      ]);
  });

  it('Testing single entry', () => {
    expect(sampleArray([1], 2)).to.deep.equal([1, 1]);
  });
});