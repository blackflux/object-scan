const expect = require('chai').expect;
const { describe } = require('node-tdd');
const PRNG = require('../helper/prng');

describe('Testing prng.js', () => {
  it('Testing random stable', () => {
    const seed = 'apple';
    const rng = PRNG(seed);
    expect(rng.seed).to.equal(seed);
    expect(rng()).to.equal(0.10752510582096875);
    expect(rng()).to.equal(0.18701425078324974);
    expect(rng()).to.equal(0.7635463380720466);
  });
});
