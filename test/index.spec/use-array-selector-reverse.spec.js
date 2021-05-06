const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('../../src/index');

describe('Testing useArraySelector + reverse', () => {
  it('Testing useArraySelector=false, reverse=false', () => {
    const haystack = [0, 1];
    const r = objectScan([''], {
      useArraySelector: false,
      reverse: false
    })(haystack);
    expect(r).to.deep.equal([[0], [1]]);
  });
});
