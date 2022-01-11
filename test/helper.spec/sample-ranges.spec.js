import { describe } from 'node-tdd';
import { expect } from 'chai';
import sampleRanges from '../helper/sample-ranges';
import PRNG from '../helper/prng';

describe('Testing sample-ranges.js', () => {
  let execute;
  before(() => {
    const visualize = (len, ranges) => {
      const result = [...Array(len).keys()].map((idx) => String.fromCharCode(97 + idx));
      ranges.forEach(([pos, repl]) => {
        result.splice(pos, repl, repl);
      });
      return result.join('');
    };
    execute = (alwaysReplace) => {
      const rng = PRNG('6e6c38f1-2506-4335-9f96-a71bf96613d4');
      const len = 3;
      const count = 1;
      const result = new Set();
      for (let idx = 0; idx < 100; idx += 1) {
        const ranges = sampleRanges(len, count, { rng, unique: true, alwaysReplace });
        const r = visualize(len, ranges);
        result.add(r);
      }
      return result;
    };
  });

  it('Testing alwaysReplace = false', () => {
    const result = execute(false);
    expect(result).to.deep.equal(new Set([
      '0abc', 'a0bc', 'ab0c', 'abc0',
      '1bc', 'a1c', 'ab1',
      '2c', 'a2',
      '3'
    ]));
  });

  it('Testing alwaysReplace = true', () => {
    const result = execute(true);
    expect(result).to.deep.equal(new Set([
      '1bc', 'a1c', 'ab1',
      '2c', 'a2',
      '3'
    ]));
  });

  it('Testing simple', () => {
    expect(sampleRanges(0, 1)).to.deep.equal([[0, 0]]);
  });
});
