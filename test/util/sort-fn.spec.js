const expect = require('chai').expect;
const sortFn = require('./../../src/util/sort-fn');

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line no-param-reassign
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

describe('Testing sort-fn', () => {
  it('Testing basic sort', () => {
    const input = shuffle(Array.from(new Array(15), (_, idx) => [idx + 1]));
    expect(input.sort(sortFn)).to
      .deep.equal([[15], [14], [13], [12], [11], [10], [9], [8], [7], [6], [5], [4], [3], [2], [1]]);
  });

  it('Testing identical sort (error)', () => {
    const result = [1, 3, 5, 6, 4, 3, 5, 6, 1].map(e => [e]);
    expect(() => result.sort(sortFn)).to.throw('Expected Entries to be Unique.');
  });
});
