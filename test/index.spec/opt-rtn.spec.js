import { describe } from 'node-tdd';
import { expect } from 'chai';
import objectScan from '../../src/index.js';

const tests = {
  context: {
    y: undefined, yc: [], n: undefined, nc: []
  },
  key: {
    y: ['array2.nested[2]', 'array2.nested[1]', 'array2.nested[0]'],
    ya: 'array2.nested[2]',
    n: [],
    na: undefined
  },
  value: {
    y: ['c', 'b', 'a'],
    ya: 'c',
    n: [],
    na: undefined
  },
  entry: {
    y: [['array2.nested[2]', 'c'], ['array2.nested[1]', 'b'], ['array2.nested[0]', 'a']],
    ya: ['array2.nested[2]', 'c'],
    n: [],
    na: undefined
  },
  property: {
    y: [2, 1, 0],
    ya: 2,
    n: [],
    na: undefined
  },
  parent: {
    y: [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']],
    ya: ['a', 'b', 'c'],
    n: [],
    na: undefined
  },
  parents: {
    y: [
      [['a', 'b', 'c'], { nested: ['a', 'b', 'c'] }, { array2: { nested: ['a', 'b', 'c'] } }],
      [['a', 'b', 'c'], { nested: ['a', 'b', 'c'] }, { array2: { nested: ['a', 'b', 'c'] } }],
      [['a', 'b', 'c'], { nested: ['a', 'b', 'c'] }, { array2: { nested: ['a', 'b', 'c'] } }]
    ],
    ya: [['a', 'b', 'c'], { nested: ['a', 'b', 'c'] }, { array2: { nested: ['a', 'b', 'c'] } }],
    n: [],
    na: undefined
  },
  bool: {
    y: true,
    ya: true,
    n: false,
    na: false
  },
  count: {
    y: 3,
    ya: 1,
    n: 0,
    na: 0
  }
};

const genTests = () => {
  const result = [];
  Object.entries(tests).forEach(([rtn, opt]) => {
    [true, false].forEach((isMatch) => {
      [false, true].forEach((withContext) => {
        [false, true].forEach((abort) => {
          const name = [
            'Testing',
            rtn,
            isMatch ? '' : '(no match)',
            abort ? 'abort' : '',
            withContext ? 'with context' : ''
          ].filter((e) => !!e).join(' ');
          result.push({
            name, rtn, opt, isMatch, withContext, abort
          });
        });
      });
    });
  });
  return result;
};

const getIdentifier = (opt, { isMatch, withContext, abort }) => {
  const yn = isMatch ? 'y' : 'n';
  const possible = [
    ...(abort ? [`${yn}a`] : []),
    ...(withContext ? [`${yn}c`] : []),
    yn
  ];
  return possible.find((e) => e in opt);
};

describe('Testing rtn option', () => {
  // eslint-disable-next-line mocha/no-setup-in-describe
  genTests().forEach(({
    name, rtn, opt, isMatch, withContext, abort
  }) => {
    it(name, () => {
      const haystack = { array2: { nested: ['a', 'b', 'c'] } };
      const find = objectScan([isMatch ? '*.*[*]' : 'unmatched'], { joined: true, rtn, abort });
      const result = withContext ? find(haystack, []) : find(haystack);
      const ident = getIdentifier(opt, { isMatch, withContext, abort });
      expect(result).to.deep.equal(opt[ident]);
    });
  });
});
