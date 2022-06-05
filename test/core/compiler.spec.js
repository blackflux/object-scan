import { describe } from 'node-tdd';
import { expect } from 'chai';
import Context from '../../src/core/context.js';
import {
  getWildcard, compile, excludedBy, traversedBy,
  hasMatches, getNeedles, matchedBy, isLeaf,
  isMatch, isLastLeafMatch, getIndex, getLeafNeedles,
  getValues
} from '../../src/core/compiler.js';

const c = (needles, ctx = {}) => compile(needles, Context(ctx));

describe('Testing compiler', () => {
  describe('Testing Redundant Needle Target Errors', () => {
    it('Testing redundant needle target', () => {
      expect(() => c(['{a,b}', 'a']))
        .to.throw('Redundant Needle Target: "{a,b}" vs "a"');
    });

    it('Testing redundant recursion (starstar)', () => {
      expect(() => c(['**.**']))
        .to.throw('Redundant Recursion: "**.**"');
    });

    it('Mixed subsequent needle collision', () => {
      expect(() => c(['bar', '!foo', 'foo']))
        .to.throw('Redundant Needle Target: "!foo" vs "foo"');
      expect(() => c(['bar', 'foo', '!foo']))
        .to.throw('Redundant Needle Target: "foo" vs "!foo"');
    });

    it('Mixed spaced needle collision', () => {
      expect(() => c(['!foo', 'bar', 'foo']))
        .to.throw('Redundant Needle Target: "!foo" vs "foo"');
      expect(() => c(['foo', 'bar', '!foo']))
        .to.throw('Redundant Needle Target: "foo" vs "!foo"');
    });

    it('Inclusion, subsequent needle collision', () => {
      expect(() => c(['once', 'once', '!o*']))
        .to.throw('Redundant Needle Target: "once" vs "once"');
    });

    it('Inclusion, spaced needle collision', () => {
      expect(() => c(['once', '!o*', 'once']))
        .to.throw('Redundant Needle Target: "once" vs "once"');
    });

    it('Exclusion, subsequent needle collision', () => {
      expect(() => c(['!once', '!once', 'o*']))
        .to.throw('Redundant Needle Target: "!once" vs "!once"');
    });

    it('Exclusion, spaced needle collision', () => {
      expect(() => c(['!once', 'o*', '!once']))
        .to.throw('Redundant Needle Target: "!once" vs "!once"');
    });

    it('Nested Exclusion Target collision', () => {
      expect(() => c(['a.b.c', 'a.!b.*', 'a.b.*']))
        .to.throw('Redundant Needle Target: "a.!b.*" vs "a.b.*"');
    });

    it('Needle Target Invalidated', () => {
      expect(() => c(['a.b', 'a.!**']))
        .to.throw('Needle Target Invalidated: "a.b" by "a.!**"');
    });

    it('Testing redundant exclusion', () => {
      expect(() => c(['!a.!b']))
        .to.throw('Redundant Exclusion: "!a.!b"');
      expect(() => c(['{!a}.{!b}']))
        .to.throw('Redundant Exclusion: "{!a}.{!b}"');
      expect(() => c(['{!a,c}.{!b,d}']))
        .to.throw('Redundant Exclusion: "{!a,c}.{!b,d}"');
      expect(() => c(['[{!0,1}][{!2,3}]']))
        .to.throw('Redundant Exclusion: "[{!0,1}][{!2,3}]"');
      expect(() => c(['!{[1][2],*,{a,b},{a.!b}}']))
        .to.throw('Redundant Exclusion: "!{[1][2],*,{a,b},{a.!b}}"');
      expect(() => c(['!**{a,!b}']))
        .to.throw('Redundant Exclusion: !**{a,!b}, char 6');
    });
  });

  it('Testing similar paths', () => {
    const input = ['a.b.c.d.e', 'a.b.c.d.f'];
    const tower = c(input);
    expect(tower).to.deep.equal({ a: { b: { c: { d: { e: {}, f: {} } } } } });
  });

  it('Testing expensive path', () => {
    const count = 10;
    const input = '[{0,1}]'.repeat(count);
    const tower = c([input]);
    const str = JSON.stringify(tower);
    expect(str.endsWith(`{}}${'}'.repeat(count)}`));
  });

  describe('Testing path component exclusion', () => {
    it('Testing forward exclusion inheritance in component path', () => {
      const input = ['{!a}.{b}'];
      const tower = c(input);
      expect(tower).to.deep.equal({ a: { b: {} } });
      expect(hasMatches(tower)).to.equal(false);
      expect(hasMatches(tower.a)).to.equal(false);
      expect(hasMatches(tower.a.b)).to.equal(false);
    });

    it('Testing no backward exclusion inheritance in component path', () => {
      const input = ['{a}.{!b}'];
      const tower = c(input);
      expect(tower).to.deep.equal({ a: { b: {} } });
      expect(hasMatches(tower)).to.equal(false);
      expect(hasMatches(tower.a)).to.equal(false);
      expect(hasMatches(tower.a.b)).to.equal(false);
    });
  });

  it('Testing similar paths exclusion', () => {
    const input = ['a.b.c.d.e', '!a.b.c.d.f'];
    const tower = c(input);
    expect(tower).to.deep.equal({ a: { b: { c: { d: { e: {}, f: {} } } } } });
    expect(hasMatches(tower)).to.equal(true);
    expect(hasMatches(tower.a)).to.equal(true);
    expect(hasMatches(tower.a.b)).to.equal(true);
    expect(hasMatches(tower.a.b.c)).to.equal(true);
    expect(hasMatches(tower.a.b.c.d)).to.equal(true);
    expect(hasMatches(tower.a.b.c.d.e)).to.equal(true);
    expect(hasMatches(tower.a.b.c.d.f)).to.equal(false);
  });

  it('Testing top level exclusion', () => {
    const input = ['!a'];
    const tower = c(input);
    expect(tower).to.deep.equal({ a: {} });
    expect(hasMatches(tower)).to.equal(false);
    expect(hasMatches(tower.a)).to.equal(false);
  });

  it('Testing Or Paths', () => {
    const input = ['{a,b.c}'];
    const tower = c(input);
    expect(tower).to.deep.equal({
      a: {},
      b: {
        c: {}
      }
    });
  });

  it('Testing Top Level Or', () => {
    const input = ['a,b'];
    const tower = c(input);
    expect(tower).to.deep.equal({
      a: {},
      b: {}
    });
  });

  it('Testing Nested Or', () => {
    const input = ['{a,{b,c}}'];
    const tower = c(input);
    expect(tower).to.deep.equal({
      a: {},
      b: {},
      c: {}
    });
  });

  it('Testing Nested Or in List', () => {
    const input = ['[{1,{0,2}}]'];
    const tower = c(input);
    expect(tower).to.deep.equal({
      '[0]': {},
      '[1]': {},
      '[2]': {}
    });
  });

  it('Testing Star Input', () => {
    const input = [
      'a.b',
      '**.b',
      '*.b',
      '*a.b',
      'a*.b',
      'a',
      '**',
      '*',
      '*a',
      'a*'
    ];
    const tower = c(input, { strict: false });
    expect(tower).to.deep.equal({
      a: { b: {} },
      '**': { b: {} },
      '*': { b: {} },
      '*a': { b: {} },
      'a*': { b: {} },
      b: {}
    });
  });

  it('Testing Star Input Array', () => {
    const input = [
      '[0][1]',
      '**[1]',
      '[*][1]',
      '[*0][1]',
      '[0*][1]',
      '[0]',
      '**',
      '[*]',
      '[*0]',
      '[0*]'
    ];
    const tower = c(input, { strict: false });
    expect(tower).to.deep.equal({
      '[0]': { '[1]': {} },
      '**': { '[1]': {} },
      '[*]': { '[1]': {} },
      '[*0]': { '[1]': {} },
      '[0*]': { '[1]': {} },
      '[1]': {}
    });
  });

  it('Testing Complex Path', () => {
    const input = ['a[1].{hello.you,there[1].*,{a.b}}[{1}],a[2],a[1].*'];
    const tower = c(input);
    expect(tower).to.deep.equal({
      a: {
        '[1]': {
          '*': {},
          hello: {
            you: {
              '[1]': {}
            }
          },
          there: {
            '[1]': {
              '*': {
                '[1]': {}
              }
            }
          },
          a: {
            b: {
              '[1]': {}
            }
          }
        },
        '[2]': {}
      }
    });
  });

  it('Testing matchedBy results are unique', () => {
    const input = ['**', '**.**'];
    const tower = c(input, { strict: false });
    expect(matchedBy([tower['**'], tower['**']]))
      .to.deep.equal(['**', '**.**']);
  });

  it('Testing traversing', () => {
    const input = ['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g'];
    const tower = c(input);
    expect(tower).to.deep.equal({
      a: {
        b: {
          d: {
            g: {}
          }
        },
        c: {
          d: {},
          f: {}
        },
        e: {
          f: {}
        }
      }
    });

    expect(isLeaf(tower)).to.equal(false);
    expect(isLeaf(tower.a)).to.equal(false);
    expect(isLeaf(tower.a.b)).to.equal(false);
    expect(isLeaf(tower.a.b.d)).to.equal(true);
    expect(isLeaf(tower.a.b.d.g)).to.equal(true);
    expect(isLeaf(tower.a.c)).to.equal(false);
    expect(isLeaf(tower.a.c.d)).to.equal(true);
    expect(isLeaf(tower.a.c.f)).to.equal(true);
    expect(isLeaf(tower.a.e)).to.equal(false);
    expect(isLeaf(tower.a.e.f)).to.equal(true);

    expect(isMatch(tower)).to.equal(false);
    expect(isMatch(tower.a)).to.equal(false);
    expect(isMatch(tower.a.b)).to.equal(false);
    expect(isMatch(tower.a.b.d)).to.equal(true);
    expect(isMatch(tower.a.b.d.g)).to.equal(false);
    expect(isMatch(tower.a.c)).to.equal(false);
    expect(isMatch(tower.a.c.d)).to.equal(true);
    expect(isMatch(tower.a.c.f)).to.equal(true);
    expect(isMatch(tower.a.e)).to.equal(false);
    expect(isMatch(tower.a.e.f)).to.equal(true);

    expect(hasMatches(tower)).to.equal(true);
    expect(hasMatches(tower.a)).to.equal(true);
    expect(hasMatches(tower.a.b)).to.equal(true);
    expect(hasMatches(tower.a.b.d)).to.equal(true);
    expect(hasMatches(tower.a.b.d.g)).to.equal(false);
    expect(hasMatches(tower.a.c)).to.equal(true);
    expect(hasMatches(tower.a.c.d)).to.equal(true);
    expect(hasMatches(tower.a.c.f)).to.equal(true);
    expect(hasMatches(tower.a.e)).to.equal(true);
    expect(hasMatches(tower.a.e.f)).to.equal(true);

    expect(getNeedles(tower)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
    expect(getNeedles(tower.a)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
    expect(getNeedles(tower.a.b)).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
    expect(getNeedles(tower.a.b.d)).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
    expect(getNeedles(tower.a.b.d.g)).to.deep.equal(['!a.b.d.g']);
    expect(getNeedles(tower.a.c)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f']);
    expect(getNeedles(tower.a.c.d)).to.deep.equal(['a.{b,c}.d']);
    expect(getNeedles(tower.a.c.f)).to.deep.equal(['a.{c,e}.f']);
    expect(getNeedles(tower.a.e)).to.deep.equal(['a.{c,e}.f']);
    expect(getNeedles(tower.a.e.f)).to.deep.equal(['a.{c,e}.f']);

    expect(getLeafNeedles(tower)).to.deep.equal([]);
    expect(getLeafNeedles(tower.a)).to.deep.equal([]);
    expect(getLeafNeedles(tower.a.b)).to.deep.equal([]);
    expect(getLeafNeedles(tower.a.b.d)).to.deep.equal(['a.{b,c}.d']);
    expect(getLeafNeedles(tower.a.b.d.g)).to.deep.equal(['!a.b.d.g']);
    expect(getLeafNeedles(tower.a.c)).to.deep.equal([]);
    expect(getLeafNeedles(tower.a.c.d)).to.deep.equal(['a.{b,c}.d']);
    expect(getLeafNeedles(tower.a.c.f)).to.deep.equal(['a.{c,e}.f']);
    expect(getLeafNeedles(tower.a.e)).to.deep.equal([]);
    expect(getLeafNeedles(tower.a.e.f)).to.deep.equal(['a.{c,e}.f']);

    expect(getWildcard(tower).regex).to.deep.equal(/^.*$/);
    expect(getWildcard(tower.a).regex).to.deep.equal(/^a$/);
    expect(getWildcard(tower.a.b).regex).to.deep.equal(/^b$/);
    expect(getWildcard(tower.a.b.d).regex).to.deep.equal(/^d$/);
    expect(getWildcard(tower.a.b.d.g).regex).to.deep.equal(/^g$/);
    expect(getWildcard(tower.a.c).regex).to.deep.equal(/^c$/);
    expect(getWildcard(tower.a.c.d).regex).to.deep.equal(/^d$/);
    expect(getWildcard(tower.a.c.f).regex).to.deep.equal(/^f$/);
    expect(getWildcard(tower.a.e).regex).to.deep.equal(/^e$/);
    expect(getWildcard(tower.a.e.f).regex).to.deep.equal(/^f$/);

    expect(getIndex(tower)).to.deep.equal(undefined);
    expect(getIndex(tower.a)).to.deep.equal(undefined);
    expect(getIndex(tower.a.b)).to.deep.equal(undefined);
    expect(getIndex(tower.a.b.d)).to.deep.equal(0);
    expect(getIndex(tower.a.b.d.g)).to.deep.equal(4);
    expect(getIndex(tower.a.c)).to.deep.equal(undefined);
    expect(getIndex(tower.a.c.d)).to.deep.equal(1);
    expect(getIndex(tower.a.c.f)).to.deep.equal(2);
    expect(getIndex(tower.a.e)).to.deep.equal(undefined);
    expect(getIndex(tower.a.e.f)).to.deep.equal(3);

    expect(isLastLeafMatch([tower])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.a])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.a.b])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.a.b.d])).to.deep.equal(true);
    expect(isLastLeafMatch([tower.a.b.d.g])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.a.c])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.a.c.d])).to.deep.equal(true);
    expect(isLastLeafMatch([tower.a.c.f])).to.deep.equal(true);
    expect(isLastLeafMatch([tower.a.e])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.a.e.f])).to.deep.equal(true);

    expect(matchedBy([tower])).to.deep.equal([]);
    expect(matchedBy([tower.a])).to.deep.equal([]);
    expect(matchedBy([tower.a.b])).to.deep.equal([]);
    expect(matchedBy([tower.a.b.d])).to.deep.equal(['a.{b,c}.d']);
    expect(matchedBy([tower.a.b.d.g])).to.deep.equal([]);
    expect(matchedBy([tower.a.c])).to.deep.equal([]);
    expect(matchedBy([tower.a.c.d])).to.deep.equal(['a.{b,c}.d']);
    expect(matchedBy([tower.a.c.f])).to.deep.equal(['a.{c,e}.f']);
    expect(matchedBy([tower.a.e])).to.deep.equal([]);
    expect(matchedBy([tower.a.e.f])).to.deep.equal(['a.{c,e}.f']);

    expect(excludedBy([tower])).to.deep.equal([]);
    expect(excludedBy([tower.a])).to.deep.equal([]);
    expect(excludedBy([tower.a.b])).to.deep.equal([]);
    expect(excludedBy([tower.a.b.d])).to.deep.equal([]);
    expect(excludedBy([tower.a.b.d.g])).to.deep.equal(['!a.b.d.g']);
    expect(excludedBy([tower.a.c])).to.deep.equal([]);
    expect(excludedBy([tower.a.c.d])).to.deep.equal([]);
    expect(excludedBy([tower.a.c.f])).to.deep.equal([]);
    expect(excludedBy([tower.a.e])).to.deep.equal([]);
    expect(excludedBy([tower.a.e.f])).to.deep.equal([]);

    expect(traversedBy([tower])).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
    expect(traversedBy([tower.a])).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
    expect(traversedBy([tower.a.b])).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
    expect(traversedBy([tower.a.b.d])).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
    expect(traversedBy([tower.a.b.d.g])).to.deep.equal(['!a.b.d.g']);
    expect(traversedBy([tower.a.c])).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f']);
    expect(traversedBy([tower.a.c.d])).to.deep.equal(['a.{b,c}.d']);
    expect(traversedBy([tower.a.c.f])).to.deep.equal(['a.{c,e}.f']);
    expect(traversedBy([tower.a.e])).to.deep.equal(['a.{c,e}.f']);
    expect(traversedBy([tower.a.e.f])).to.deep.equal(['a.{c,e}.f']);
  });

  describe('Testing multi step recursion', () => {
    it('Testing basic two step (star)', () => {
      const input = ['**{a.b}.a'];
      const tower = c(input);
      expect(tower).to.deep.equal({ a: { b: { a: {} } } });
      expect(getValues(tower)).to.deep.equal([tower.a]);
      expect(getValues(tower.a)).to.deep.equal([tower.a.b]);
      expect(getValues(tower.a.b)).to.deep.equal([tower.a.b.a, tower.a]);
      expect(getValues(tower.a.b.a)).to.deep.equal([]);
    });
  });
});
