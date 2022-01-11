import { describe } from 'node-tdd';
import { expect } from 'chai';
import objectScan from '../../src/index';

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
