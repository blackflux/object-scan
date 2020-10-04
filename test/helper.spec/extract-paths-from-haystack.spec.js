const expect = require('chai').expect;
const { describe } = require('node-tdd');
const extractPathsFromHaystack = require('../helper/extract-paths-from-haystack');

describe('Testing extract-paths-from-haystack.js', () => {
  it('Testing with useArraySelector', () => {
    const haystack = { a: [{ '&': 0, f: [1, { F: 2, ',': 3, ';': 4 }] }] };
    const needles = extractPathsFromHaystack(haystack);
    expect(needles).to.deep.equal([
      ['a', 0, 'f', 1, ';'],
      ['a', 0, 'f', 1, ','],
      ['a', 0, 'f', 1, 'F'],
      ['a', 0, 'f', 0],
      ['a', 0, '&']
    ]);
  });

  it('Testing special character in haystack', () => {
    const needles = extractPathsFromHaystack({ '*force': true });
    expect(needles).to.deep.equal([['*force']]);
  });
});
