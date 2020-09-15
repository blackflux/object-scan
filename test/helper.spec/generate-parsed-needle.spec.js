const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateParsedNeedle = require('../helper/generate-parsed-needle');

describe('Testing generate-parsed-needle.js', { cryptoSeed: '04eb4846-3b0c-4168-82fe-5a955f5161e3' }, () => {
  it('Testing example', () => {
    expect(generateParsedNeedle()).to.deep.equal(
      new Set([
        [
          new Set(['a', ['b'], '[9]']),
          ['[11]', '[6]', 'c'],
          ['[3]', new Set(['[12]', '[1]']), '[14]', '[2]'],
          'd'
        ],
        new Set([
          '[13]',
          new Set(['[8]', 'e', new Set(['[4]', 'f', 'g']), 'h'])
        ]),
        new Set(['i'])
      ])
    );
  });
});
