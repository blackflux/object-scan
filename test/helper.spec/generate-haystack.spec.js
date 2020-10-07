const expect = require('chai').expect;
const fs = require('smart-fs');
const path = require('path');
const { describe } = require('node-tdd');
const PRNG = require('../helper/prng');
const generateHaystack = require('../helper/generate-haystack');
const haystackGenerator = require('../helper/haystack-generator');

describe('Testing generate-haystack.js', () => {
  it('Testing example', () => {
    const rng = PRNG('3b8c58e7-436d-4229-8ad5-eca7670fb803');
    const generator = haystackGenerator({ rng });
    const haystack = generateHaystack(generator);

    const filename = path.join(`${__filename}__resources`, 'example-haystack.json');
    const result = fs.smartWrite(filename, haystack);
    expect(result).to.equal(false);
  });
});
