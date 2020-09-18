const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateHaystack = require('../helper/generate-haystack');
const haystackGenerator = require('../helper/haystack-generator');

describe('Testing generate-haystack.js', () => {
  it('Testing example', () => {
    const haystack = generateHaystack(haystackGenerator('cb8c58e7-436d-4229-8ad5-eca7670fb803'));
    expect(haystack).to.deep.equal({ Q: [{ d: 0, T: [1, { y: 2, h: 3, r: 4 }] }] });
  });
});
