import { describe } from 'node-tdd';
import { expect } from 'chai';
import objectScan from '../../src/index.js';

describe('Testing rtn', () => {
  const input = { f: { b: { a: null, d: { c: {}, e: {} } }, g: { i: { h: {} } } } };
  // eslint-disable-next-line mocha/no-setup-in-describe
  input.f.g = input;
  const pattern = ['*.b.a', '!f.g', '*.g'];

  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    ['context', undefined],
    ['key', [['f', 'g'], ['f', 'b', 'a']]],
    ['value', [input, null]],
    ['entry', [[['f', 'g'], input], [['f', 'b', 'a'], null]]],
    [['property', 'value'], [['g', input], ['a', null]]],
    [({ property }) => property === 'g', [true, false]],
    ['property', ['g', 'a']],
    ['gproperty', ['f', 'b']],
    // eslint-disable-next-line mocha/no-setup-in-describe
    ['parent', [input.f, input.f.b]],
    // eslint-disable-next-line mocha/no-setup-in-describe
    ['gparent', [input, input.f]],
    // eslint-disable-next-line mocha/no-setup-in-describe
    ['parents', [[input.f, input], [input.f.b, input.f, input]]],
    ['isMatch', [true, true]],
    ['matchedBy', [['*.g'], ['*.b.a']]],
    ['excludedBy', [['!f.g'], []]],
    ['traversedBy', [['*.g', '!f.g'], ['*.b.a']]],
    ['isCircular', [true, false]],
    ['isLeaf', [false, true]],
    ['depth', [2, 3]],
    ['bool', true],
    ['count', 2]
  ].forEach(([rtn, expected]) => {
    it(`Testing ${rtn}`, () => {
      const r = objectScan(pattern, { rtn })(input);
      expect(r).to.deep.equal(expected);
    });
  });
});
