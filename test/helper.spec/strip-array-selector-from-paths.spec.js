import { describe } from 'node-tdd';
import { expect } from 'chai';
import stripArraySelectorFromPaths from '../helper/strip-array-selector-from-paths.js';

describe('Testing strip-array-selector-from-paths.js', () => {
  it('Testing example', () => {
    const input = [
      ['a', 0, 'f', 1, ';'],
      ['a', 0, 'f', 1, ','],
      ['a', 0, 'f', 1, 'F'],
      ['a', 0, 'f', 0],
      ['a', 0, 'f', 1],
      ['a', 0, '&']
    ];
    expect(stripArraySelectorFromPaths(input)).to.deep.equal([
      ['a', 'f', ';'],
      ['a', 'f', ','],
      ['a', 'f', 'F'],
      ['a', 'f'],
      ['a', '&']
    ]);
  });
});
