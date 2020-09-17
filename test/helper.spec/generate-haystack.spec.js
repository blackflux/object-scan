const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateHaystack = require('../helper/generate-haystack');
const sampleArray = require('../helper/sample-array');
const PRNG = require('../helper/prng');
const chars = require('../helper/resources/chars.json');

describe('Testing generate-haystack.js', () => {
  it('Testing example', () => {
    const rng = PRNG('cb8c58e7-436d-4229-8ad5-eca7670fb803');
    const generator = ({ count, depth }) => {
      if (count >= 5) {
        return undefined;
      }
      if (depth > Math.floor(rng() * 5)) {
        return null;
      }
      const mkArray = rng() > 0.5;
      const len = Math.floor(rng() * 5);
      return mkArray ? len : sampleArray(chars, len, rng);
    };
    const haystack = generateHaystack(generator);
    expect(haystack).to.deep.equal({ Q: [{ d: 0, T: [1, { y: 2, h: 3, r: 4 }] }] });
  });
});
