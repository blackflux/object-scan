const expect = require('chai').expect;
const { describe } = require('node-tdd');
const PRNG = require('../helper/prng');
const generateHaystack = require('../helper/generate-haystack');
const haystackGenerator = require('../helper/haystack-generator');
const extractPathsFromHaystack = require('../helper/extract-paths-from-haystack');

describe('Testing extract-paths-from-haystack.js', () => {
  it('Testing example', () => {
    const rng = PRNG('cb8c58e7-436d-4229-8ad5-eca7670fb803');
    const generator = haystackGenerator(rng);
    const haystack = generateHaystack(generator);
    expect(haystack).to.deep.equal({ Q: [{ d: 0, T: [1, { y: 2, h: 3, r: 4 }] }] });
    const needles = extractPathsFromHaystack(haystack);
    expect(needles).to.deep.equal([
      ['Q', 0, 'd'],
      ['Q', 0, 'T', 0],
      ['Q', 0, 'T', 1, 'y'],
      ['Q', 0, 'T', 1, 'h'],
      ['Q', 0, 'T', 1, 'r']
    ]);
  });

  it('Testing special character in haystack', () => {
    const needles = extractPathsFromHaystack({ '*force': true });
    expect(needles).to.deep.equal([['*force']]);
  });
});
