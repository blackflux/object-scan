const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('../../src/index');

describe('Testing rtn option', () => {
  let execute;
  before(() => {
    const haystack = { array2: { nested: ['a', 'b', 'c'] } };
    execute = (rtn, ctx, match, expected) => {
      const find = objectScan([match ? '*.*[*]' : 'unmatched'], { joined: true, rtn });
      expect(ctx ? find(haystack, []) : find(haystack)).to.deep.equal(expected);
    };
  });

  it('Testing context', () => execute('context', false, true, undefined));
  it('Testing context with context', () => execute('context', true, true, []));

  it('Testing context (no match)', () => execute('context', false, false, undefined));
  it('Testing context (no match) with context', () => execute('context', true, false, []));

  it('Testing keys', () => execute('keys', false, true, [
    'array2.nested[2]', 'array2.nested[1]', 'array2.nested[0]'
  ]));
  it('Testing keys with context', () => execute('keys', true, true, [
    'array2.nested[2]', 'array2.nested[1]', 'array2.nested[0]'
  ]));

  it('Testing keys (no match)', () => execute('keys', false, false, []));
  it('Testing keys (no match) with context', () => execute('keys', true, false, []));

  it('Testing values', () => execute('values', false, true, ['c', 'b', 'a']));
  it('Testing values with context', () => execute('values', true, true, ['c', 'b', 'a']));

  it('Testing values (no match)', () => execute('values', false, false, []));
  it('Testing values (no match) with context', () => execute('values', true, false, []));

  it('Testing entries', () => execute('entries', false, true, [
    ['array2.nested[2]', 'c'], ['array2.nested[1]', 'b'], ['array2.nested[0]', 'a']
  ]));
  it('Testing entries with context', () => execute('entries', true, true, [
    ['array2.nested[2]', 'c'], ['array2.nested[1]', 'b'], ['array2.nested[0]', 'a']
  ]));

  it('Testing entries (no match)', () => execute('entries', false, false, []));
  it('Testing entries (no match) with context', () => execute('entries', true, false, []));

  it('Testing key', () => execute('key', false, true, 'array2.nested[2]'));
  it('Testing key with context', () => execute('key', true, true, 'array2.nested[2]'));

  it('Testing key (no match)', () => execute('key', false, false, undefined));
  it('Testing key (no match) with context', () => execute('key', true, false, undefined));

  it('Testing value', () => execute('value', false, true, 'c'));
  it('Testing value with context', () => execute('value', true, true, 'c'));

  it('Testing value (no match)', () => execute('value', false, false, undefined));
  it('Testing value (no match) with context', () => execute('value', true, false, undefined));

  it('Testing entry', () => execute('entry', false, true, ['array2.nested[2]', 'c']));
  it('Testing entry with context', () => execute('entry', true, true, ['array2.nested[2]', 'c']));

  it('Testing entry (no match)', () => execute('entry', false, false, undefined));
  it('Testing entry with context (no match)', () => execute('entry', true, false, undefined));

  it('Testing bool', () => execute('bool', false, true, true));
  it('Testing bool with context', () => execute('bool', true, true, true));

  it('Testing bool (no match)', () => execute('bool', false, false, false));
  it('Testing bool (no match) with context', () => execute('bool', true, false, false));
});
