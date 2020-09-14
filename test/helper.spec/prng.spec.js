const expect = require('chai').expect;
const { describe } = require('node-tdd');
const PRNG = require('../helper/prng');

describe('Testing prng.js', () => {
  it('Testing random stable', () => {
    const seed = PRNG('apple');
    expect(seed()).to.equal(0.10752510582096875);
    expect(seed()).to.equal(0.18701425078324974);
    expect(seed()).to.equal(0.7635463380720466);
  });
});
