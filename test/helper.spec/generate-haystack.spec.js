const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateHaystack = require('../helper/generate-haystack');
const sampleArray = require('../helper/sample-array');
const PRNG = require('../helper/prng');
const chars = require('../helper/resources/chars.json');

describe('Testing generate-haystack.js', () => {
  it('Testing example', () => {
    const rng = PRNG('cb8c58e7-436d-4229-8ad5-eca7670fb803');
    const haystack = generateHaystack({
      keys: (len) => sampleArray(chars, len, rng),
      array: () => rng() > 0.5,
      arrayLength: () => Math.floor(rng() * 5),
      objectLength: () => Math.floor(rng() * 5),
      maxDepth: () => Math.floor(rng() * 5),
      maxNodes: 5
    });
    expect(haystack).to.deep.equal({ Q: [{ d: 0, T: [1, { y: 2, h: 3, r: 4 }] }] });
  });
});
