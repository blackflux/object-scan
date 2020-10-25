const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('../../src/index');

const tests = {
  context: { context: true, y: [], n: undefined },
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
      [true, false].forEach((withContext) => {
        it(`Testing ${rtn}${isMatch ? '' : ' (no match)'}${withContext ? ' with context' : ''}`, () => {
          const haystack = { array2: { nested: ['a', 'b', 'c'] } };
          const find = objectScan([isMatch ? '*.*[*]' : 'unmatched'], { joined: true, rtn });
          if (opt.context === true) {
            expect(withContext ? find(haystack, []) : find(haystack)).to.deep.equal(withContext ? opt.y : opt.n);
          } else {
            expect(withContext ? find(haystack, []) : find(haystack)).to.deep.equal(isMatch ? opt.y : opt.n);
          }
        });
      });
    });
  });
});
