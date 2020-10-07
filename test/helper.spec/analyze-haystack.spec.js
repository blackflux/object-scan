const expect = require('chai').expect;
const { describe } = require('node-tdd');
const analyzeHaystack = require('../helper/analyze-haystack');

describe('Testing analyze-haystack.js', () => {
  it('Testing basic', () => {
    const r = analyzeHaystack({ parent: [{ v: 1 }, { v: 2 }] });
    expect(r).to.deep.equal({ branchingFactor: 1.25, depth: 3, leaves: 2 });
  });

  it('Testing empty object', () => {
    const r = analyzeHaystack({});
    expect(r).to.deep.equal({ branchingFactor: 0, depth: 0, leaves: 0 });
  });

  it('Testing empty array', () => {
    const r = analyzeHaystack({});
    expect(r).to.deep.equal({ branchingFactor: 0, depth: 0, leaves: 0 });
  });
});
