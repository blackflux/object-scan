import { describe } from 'node-tdd';
import { expect } from 'chai';
import analyzeHaystack from '../helper/analyze-haystack.js';

describe('Testing analyze-haystack.js', () => {
  it('Testing basic', () => {
    const r = analyzeHaystack({ parent: [{ v: 1 }, { v: 2 }] });
    expect(r).to.deep.equal({
      branchingFactor: 1.25,
      depth: 3,
      leaves: 2,
      hasArray: true,
      hasObject: true
    });
  });

  it('Testing empty object', () => {
    const r = analyzeHaystack({});
    expect(r).to.deep.equal({
      branchingFactor: 0,
      depth: 0,
      leaves: 0,
      hasArray: false,
      hasObject: true
    });
  });

  it('Testing empty array', () => {
    const r = analyzeHaystack([]);
    expect(r).to.deep.equal({
      branchingFactor: 0,
      depth: 0,
      leaves: 0,
      hasArray: true,
      hasObject: false
    });
  });
});
