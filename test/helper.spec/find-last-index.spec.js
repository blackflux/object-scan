import { describe } from 'node-tdd';
import { expect } from 'chai';
import findLastIndex from '../helper/find-last-index';

describe('Testing find-last-index.js', () => {
  it('Testing not found', () => {
    const r = findLastIndex([0, 1, 2], (e) => e === 3);
    expect(r).to.equal(-1);
  });

  it('Testing found', () => {
    const r = findLastIndex([0, 1, 1, 2], (e) => e === 1);
    expect(r).to.equal(2);
  });

  it('Testing found by idx', () => {
    const r = findLastIndex([0, 1, 1, 2], (e, idx) => idx === 1);
    expect(r).to.equal(1);
  });
});
