const { expect } = require('chai');
const sortFn = require('../../src/util/sortFn');

describe('Testing sortFn.', () => {
  it('Testing basic sort.', () => {
    expect([[2, 'c'], ['a'], ['a'], ['a', 'a', 'a'], ['b', 'b'], ['b', 'b', 'b'], [3, 'a'], ['c'], ['b']].sort(sortFn))
      .to.deep.equal([['b', 'b', 'b'], ['a', 'a', 'a'], ['b', 'b'], [3, 'a'], [2, 'c'], ['c'], ['b'], ['a'], ['a']]);
  });
});
