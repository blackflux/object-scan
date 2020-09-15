const expect = require('chai').expect;
const { describe } = require('node-tdd');
const sampleArray = require('../helper/sample-array');
const PRNG = require('../helper/prng');

describe('Testing sample-array.js', () => {
  it('Testing example', () => {
    const rng = PRNG('6e6c38f1-2506-4335-9f96-a71bf96613d4');
    expect(sampleArray([1, 2, 3, 4, 5, 6, 7], 3, rng)).to.deep.equal([6, 5, 1]);
  });
});
