import { describe } from 'node-tdd';
import { expect } from 'chai';
import Context from '../../src/core/context.js';
import { compile } from '../../src/core/compiler.js';
import {
  excludedBy, traversedBy,
  matchedBy, isLastLeafMatch
} from '../../src/core/find-util.js';

const c = (needles, ctx = {}) => compile(needles, Context(ctx));
const ser = (root, verbose = false) => {
  const map = new Map();
  const get = (node) => {
    if (!map.has(node)) {
      map.set(node, map.size);
    }
    return verbose ? `:${map.get(node)}` : '';
  };
  const known = new Set();
  const rec = (node) => {
    if (known.has(node)) {
      return `REF<${node.value}${get(node)}>`;
    }
    known.add(node);
    const r = Object
      .fromEntries(node.values.map((v) => [
        `${v.value}${get(v)}`,
        rec(v)
      ]));
    known.delete(node);
    return r;
  };
  return rec(root);
};

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
    expect(ser(tower)).to.deep.equal({ a: { b: { c: { d: { e: {}, f: {} } } } } });
  });

  it('Testing expensive path', () => {
    const count = 10;
    const input = '[{0,1}]'.repeat(count);
    const tower = c([input]);
    const str = JSON.stringify(ser(tower));
    expect(str.endsWith(`{}}${'}'.repeat(count)}`));
  });

  describe('Testing path component exclusion', () => {
    it('Testing forward exclusion inheritance in component path', () => {
      const input = ['{!a}.{b}'];
      const tower = c(input);
      expect(ser(tower)).to.deep.equal({ a: { b: {} } });
      expect(tower.matches).to.equal(false);
      expect(tower.get('a').matches).to.equal(false);
      expect(tower.get('a').get('b').matches).to.equal(false);
    });

    it('Testing no backward exclusion inheritance in component path', () => {
      const input = ['{a}.{!b}'];
      const tower = c(input);
      expect(ser(tower)).to.deep.equal({ a: { b: {} } });
      expect(tower.matches).to.equal(false);
      expect(tower.get('a').matches).to.equal(false);
      expect(tower.get('a').get('b').matches).to.equal(false);
    });
  });

  it('Testing similar paths exclusion', () => {
    const input = ['a.b.c.d.e', '!a.b.c.d.f'];
    const tower = c(input);
    expect(ser(tower)).to.deep.equal({ a: { b: { c: { d: { e: {}, f: {} } } } } });
    expect(tower.matches).to.equal(true);
    expect(tower.get('a').matches).to.equal(true);
    expect(tower.get('a').get('b').matches).to.equal(true);
    expect(tower.get('a').get('b').get('c').matches).to.equal(true);
    expect(tower.get('a').get('b').get('c').get('d').matches).to.equal(true);
    expect(tower.get('a').get('b').get('c').get('d')
      .get('e').matches).to.equal(true);
    expect(tower.get('a').get('b').get('c').get('d')
      .get('f').matches).to.equal(false);
  });

  it('Testing top level exclusion', () => {
    const input = ['!a'];
    const tower = c(input);
    expect(ser(tower)).to.deep.equal({ a: {} });
    expect(tower.matches).to.equal(false);
    expect(tower.get('a').matches).to.equal(false);
  });

  it('Testing Or Paths', () => {
    const input = ['{a,b.c}'];
    const tower = c(input);
    expect(ser(tower)).to.deep.equal({
      a: {},
      b: {
        c: {}
      }
    });
  });

  it('Testing Top Level Or', () => {
    const input = ['a,b'];
    const tower = c(input);
    expect(ser(tower)).to.deep.equal({
      a: {},
      b: {}
    });
  });

  it('Testing Nested Or', () => {
    const input = ['{a,{b,c}}'];
    const tower = c(input);
    expect(ser(tower)).to.deep.equal({
      a: {},
      b: {},
      c: {}
    });
  });

  it('Testing Nested Or in List', () => {
    const input = ['[{1,{0,2}}]'];
    const tower = c(input);
    expect(ser(tower)).to.deep.equal({
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
    expect(ser(tower)).to.deep.equal({
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
    expect(ser(tower)).to.deep.equal({
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
    expect(ser(tower)).to.deep.equal({
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
    expect(matchedBy([tower.get('**'), tower.get('**')]))
      .to.deep.equal(['**', '**.**']);
  });

  it('Testing traversing', () => {
    const input = ['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g'];
    const tower = c(input);
    expect(ser(tower)).to.deep.equal({
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

    expect(tower.match).to.equal(false);
    expect(tower.get('a').match).to.equal(false);
    expect(tower.get('a').get('b').match).to.equal(false);
    expect(tower.get('a').get('b').get('d').match).to.equal(true);
    expect(tower.get('a').get('b').get('d').get('g').match).to.equal(false);
    expect(tower.get('a').get('c').match).to.equal(false);
    expect(tower.get('a').get('c').get('d').match).to.equal(true);
    expect(tower.get('a').get('c').get('f').match).to.equal(true);
    expect(tower.get('a').get('e').match).to.equal(false);
    expect(tower.get('a').get('e').get('f').match).to.equal(true);

    expect(tower.matches).to.equal(true);
    expect(tower.get('a').matches).to.equal(true);
    expect(tower.get('a').get('b').matches).to.equal(true);
    expect(tower.get('a').get('b').get('d').matches).to.equal(true);
    expect(tower.get('a').get('b').get('d').get('g').matches).to.equal(false);
    expect(tower.get('a').get('c').matches).to.equal(true);
    expect(tower.get('a').get('c').get('d').matches).to.equal(true);
    expect(tower.get('a').get('c').get('f').matches).to.equal(true);
    expect(tower.get('a').get('e').matches).to.equal(true);
    expect(tower.get('a').get('e').get('f').matches).to.equal(true);

    expect(tower.needles).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
    expect(tower.get('a').needles).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
    expect(tower.get('a').get('b').needles).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
    expect(tower.get('a').get('b').get('d').needles).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
    expect(tower.get('a').get('b').get('d').get('g').needles).to.deep.equal(['!a.b.d.g']);
    expect(tower.get('a').get('c').needles).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f']);
    expect(tower.get('a').get('c').get('d').needles).to.deep.equal(['a.{b,c}.d']);
    expect(tower.get('a').get('c').get('f').needles).to.deep.equal(['a.{c,e}.f']);
    expect(tower.get('a').get('e').needles).to.deep.equal(['a.{c,e}.f']);
    expect(tower.get('a').get('e').get('f').needles).to.deep.equal(['a.{c,e}.f']);

    expect(tower.leafNeedles).to.deep.equal([]);
    expect(tower.get('a').leafNeedles).to.deep.equal([]);
    expect(tower.get('a').get('b').leafNeedles).to.deep.equal([]);
    expect(tower.get('a').get('b').get('d').leafNeedles).to.deep.equal(['a.{b,c}.d']);
    expect(tower.get('a').get('b').get('d').get('g').leafNeedles).to.deep.equal(['!a.b.d.g']);
    expect(tower.get('a').get('c').leafNeedles).to.deep.equal([]);
    expect(tower.get('a').get('c').get('d').leafNeedles).to.deep.equal(['a.{b,c}.d']);
    expect(tower.get('a').get('c').get('f').leafNeedles).to.deep.equal(['a.{c,e}.f']);
    expect(tower.get('a').get('e').leafNeedles).to.deep.equal([]);
    expect(tower.get('a').get('e').get('f').leafNeedles).to.deep.equal(['a.{c,e}.f']);

    expect(tower.regex).to.deep.equal(null);
    expect(tower.get('a').regex).to.have.all.keys('test');
    expect(tower.get('a').get('b').regex).to.have.all.keys('test');
    expect(tower.get('a').get('b').get('d').regex).to.have.all.keys('test');
    expect(tower.get('a').get('b').get('d').get('g').regex).to.have.all.keys('test');
    expect(tower.get('a').get('c').regex).to.have.all.keys('test');
    expect(tower.get('a').get('c').get('d').regex).to.have.all.keys('test');
    expect(tower.get('a').get('c').get('f').regex).to.have.all.keys('test');
    expect(tower.get('a').get('e').regex).to.have.all.keys('test');
    expect(tower.get('a').get('e').get('f').regex).to.have.all.keys('test');

    expect(tower.index).to.deep.equal(undefined);
    expect(tower.get('a').index).to.deep.equal(undefined);
    expect(tower.get('a').get('b').index).to.deep.equal(undefined);
    expect(tower.get('a').get('b').get('d').index).to.deep.equal(0);
    expect(tower.get('a').get('b').get('d').get('g').index).to.deep.equal(4);
    expect(tower.get('a').get('c').index).to.deep.equal(undefined);
    expect(tower.get('a').get('c').get('d').index).to.deep.equal(1);
    expect(tower.get('a').get('c').get('f').index).to.deep.equal(2);
    expect(tower.get('a').get('e').index).to.deep.equal(undefined);
    expect(tower.get('a').get('e').get('f').index).to.deep.equal(3);

    expect(isLastLeafMatch([tower])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.get('a')])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.get('a').get('b')])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.get('a').get('b').get('d')])).to.deep.equal(true);
    expect(isLastLeafMatch([tower.get('a').get('b').get('d').get('g')])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.get('a').get('c')])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.get('a').get('c').get('d')])).to.deep.equal(true);
    expect(isLastLeafMatch([tower.get('a').get('c').get('f')])).to.deep.equal(true);
    expect(isLastLeafMatch([tower.get('a').get('e')])).to.deep.equal(false);
    expect(isLastLeafMatch([tower.get('a').get('e').get('f')])).to.deep.equal(true);

    expect(matchedBy([tower])).to.deep.equal([]);
    expect(matchedBy([tower.get('a')])).to.deep.equal([]);
    expect(matchedBy([tower.get('a').get('b')])).to.deep.equal([]);
    expect(matchedBy([tower.get('a').get('b').get('d')])).to.deep.equal(['a.{b,c}.d']);
    expect(matchedBy([tower.get('a').get('b').get('d').get('g')])).to.deep.equal([]);
    expect(matchedBy([tower.get('a').get('c')])).to.deep.equal([]);
    expect(matchedBy([tower.get('a').get('c').get('d')])).to.deep.equal(['a.{b,c}.d']);
    expect(matchedBy([tower.get('a').get('c').get('f')])).to.deep.equal(['a.{c,e}.f']);
    expect(matchedBy([tower.get('a').get('e')])).to.deep.equal([]);
    expect(matchedBy([tower.get('a').get('e').get('f')])).to.deep.equal(['a.{c,e}.f']);

    expect(excludedBy([tower])).to.deep.equal([]);
    expect(excludedBy([tower.get('a')])).to.deep.equal([]);
    expect(excludedBy([tower.get('a').get('b')])).to.deep.equal([]);
    expect(excludedBy([tower.get('a').get('b').get('d')])).to.deep.equal([]);
    expect(excludedBy([tower.get('a').get('b').get('d').get('g')])).to.deep.equal(['!a.b.d.g']);
    expect(excludedBy([tower.get('a').get('c')])).to.deep.equal([]);
    expect(excludedBy([tower.get('a').get('c').get('d')])).to.deep.equal([]);
    expect(excludedBy([tower.get('a').get('c').get('f')])).to.deep.equal([]);
    expect(excludedBy([tower.get('a').get('e')])).to.deep.equal([]);
    expect(excludedBy([tower.get('a').get('e').get('f')])).to.deep.equal([]);

    expect(traversedBy([tower])).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
    expect(traversedBy([tower.get('a')])).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
    expect(traversedBy([tower.get('a').get('b')])).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
    expect(traversedBy([tower.get('a').get('b').get('d')])).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
    expect(traversedBy([tower.get('a').get('b').get('d').get('g')])).to.deep.equal(['!a.b.d.g']);
    expect(traversedBy([tower.get('a').get('c')])).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f']);
    expect(traversedBy([tower.get('a').get('c').get('d')])).to.deep.equal(['a.{b,c}.d']);
    expect(traversedBy([tower.get('a').get('c').get('f')])).to.deep.equal(['a.{c,e}.f']);
    expect(traversedBy([tower.get('a').get('e')])).to.deep.equal(['a.{c,e}.f']);
    expect(traversedBy([tower.get('a').get('e').get('f')])).to.deep.equal(['a.{c,e}.f']);
  });

  describe('Testing multi step recursion', () => {
    it('Testing basic two step (star)', () => {
      const input = ['**{a.b}.a'];
      const tower = c(input);
      expect(ser(tower, true)).to.deep.equal({
        'a:0': {},
        'a:1': {
          'b:2': {
            'a:1': 'REF<a:1>',
            'a:3': {}
          }
        }
      });
    });

    it('Testing with exclude', () => {
      const input = ['**{a}', '!**{a.a}'];
      const tower = c(input);
      expect(ser(tower, true)).to.deep.equal({
        'a:0': {
          'a:1': {
            'a:0': 'REF<a:0>'
          }
        },
        'a:2': {
          'a:2': 'REF<a:2>'
        }
      });
    });
  });
});
