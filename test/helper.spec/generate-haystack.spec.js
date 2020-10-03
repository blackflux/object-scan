const expect = require('chai').expect;
const { describe } = require('node-tdd');
const PRNG = require('../helper/prng');
const generateHaystack = require('../helper/generate-haystack');
const haystackGenerator = require('../helper/haystack-generator');

describe('Testing generate-haystack.js', () => {
  it('Testing example', () => {
    const rng = PRNG('cb8c58e7-436d-4229-8ad5-eca7670fb803');
    const generator = haystackGenerator({ rng });
    const haystack = generateHaystack(generator);
    expect(haystack).to.deep.equal({ a: [{ '&': 0, f: [1, { F: 2, ',': 3, ';': 4 }] }] });
  });
});
