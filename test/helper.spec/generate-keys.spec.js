const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateKeys = require('../helper/generate-keys');

describe('Testing generate-keys.js', { cryptoSeed: 'c9bfe12c-329a-4d3a-afb7-71fbca2cb77b' }, () => {
  it('Testing example', () => {
    const r = generateKeys(10);
    expect(r).to.deep.equal([
      'ysuCl', 'was', 'bf1[<all', 'running', 'wild',
      'harder', 'road', 'y~{2Z|;U:', '<i>.', 'axerkS~ia1e'
    ]);
  });
});
