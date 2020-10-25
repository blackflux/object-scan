const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('../../src/index');

describe('Testing rtn option', () => {
  let execute;
  before(() => {
    const haystack = { array2: { nested: ['a', 'b', 'c'] } };
    execute = (rtn, ctx, expected) => {
      const find = objectScan(['*.*[*]'], { joined: true, rtn });
      expect(ctx ? find(haystack, []) : find(haystack)).to.deep.equal(expected);
    };
  });

  it('Testing keys', () => execute('keys', false, [
    'array2.nested[2]', 'array2.nested[1]', 'array2.nested[0]'
  ]));
  it('Testing keys with context', () => execute('keys', true, [
    'array2.nested[2]', 'array2.nested[1]', 'array2.nested[0]'
  ]));

  it('Testing values', () => execute('values', false, ['c', 'b', 'a']));
  it('Testing values with context', () => execute('values', true, ['c', 'b', 'a']));

  it('Testing entries', () => execute('entries', false, [
    ['array2.nested[2]', 'c'], ['array2.nested[1]', 'b'], ['array2.nested[0]', 'a']
  ]));
  it('Testing entries with context', () => execute('entries', true, [
    ['array2.nested[2]', 'c'], ['array2.nested[1]', 'b'], ['array2.nested[0]', 'a']
  ]));

  it('Testing key', () => execute('key', false, 'array2.nested[2]'));
  it('Testing key with context', () => execute('key', true, 'array2.nested[2]'));

  it('Testing value', () => execute('value', false, 'c'));
  it('Testing value with context', () => execute('value', true, 'c'));

  it('Testing entry', () => execute('entry', false, ['array2.nested[2]', 'c']));
  it('Testing entry with context', () => execute('entry', true, ['array2.nested[2]', 'c']));

  it('Testing context', () => execute('context', false, undefined));
  it('Testing context with context', () => execute('context', true, []));
});
