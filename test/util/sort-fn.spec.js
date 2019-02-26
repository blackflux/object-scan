const expect = require('chai').expect;
const sortFn = require('./../../src/util/sort-fn');


describe('Testing sort-fn', () => {
  it('Testing identical sort', () => {
    const result = [1, 3, 5, 6, 4, 3, 5, 6, 1].map(e => [e]).sort(sortFn);
    expect(result).to.deep.equal([[6], [6], [5], [5], [4], [3], [3], [1], [1]]);
  });
});
