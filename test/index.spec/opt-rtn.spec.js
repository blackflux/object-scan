const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('../../src/index');

const tests = {
  context: { onContext: true, y: [], n: undefined },
  keys: { y: ['array2.nested[2]', 'array2.nested[1]', 'array2.nested[0]'], n: [] },
  values: { y: ['c', 'b', 'a'], n: [] },
  entries: { y: [['array2.nested[2]', 'c'], ['array2.nested[1]', 'b'], ['array2.nested[0]', 'a']], n: [] },
  key: { y: 'array2.nested[2]', n: undefined },
  value: { y: 'c', n: undefined },
  entry: { y: ['array2.nested[2]', 'c'], n: undefined },
  bool: { y: true, n: false }
};

describe('Testing rtn option', () => {
  // eslint-disable-next-line mocha/no-setup-in-describe
  Object.entries(tests).forEach(([rtn, opt]) => {
    [true, false].forEach((isMatch) => {
      [false, true].forEach((withContext) => {
        it(`Testing ${rtn}${isMatch ? '' : ' (no match)'}${withContext ? ' with context' : ''}`, () => {
          const haystack = { array2: { nested: ['a', 'b', 'c'] } };
          const find = objectScan([isMatch ? '*.*[*]' : 'unmatched'], { joined: true, rtn });
          const result = withContext ? find(haystack, []) : find(haystack);
          expect(result).to.deep.equal(
            (opt.onContext === true ? withContext : isMatch) ? opt.y : opt.n
          );
        });
      });
    });
  });
});
