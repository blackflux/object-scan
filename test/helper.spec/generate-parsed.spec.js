const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateParsed = require('../helper/generate-parsed');

describe('Testing generate-parsed.js', { cryptoSeed: '04eb4846-3b0c-4168-82fe-5a955f5161e3' }, () => {
  it('Testing example', () => {
    expect(generateParsed()).to.deep.equal(
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
