import { describe } from 'node-tdd';
import { expect } from 'chai';
import PRNG from '../helper/prng';
import shuffleArray from '../helper/shuffle-array';

describe('Testing shuffle-array.js', { cryptoSeed: '477f1b9e-ab84-4770-b7c1-b4a7fb162979' }, () => {
  it('Testing example', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7];
    const r = shuffleArray(arr);
    expect(arr).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(r).to.deep.equal([6, 3, 7, 0, 1, 5, 2, 4]);
  });

  it('Testing example with PRNG', () => {
    const rng = PRNG('4a4de527-3ee5-462e-8ee5-ba4ae984566e');
    const arr = [0, 1, 2, 3, 4, 5, 6, 7];
    const r = shuffleArray(arr, rng);
    expect(arr).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(r).to.deep.equal([4, 7, 0, 3, 2, 6, 1, 5]);
  });
});
