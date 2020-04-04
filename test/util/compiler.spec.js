const expect = require('chai').expect;
const { describe } = require('node-tdd');
const compiler = require('../../src/util/compiler');

describe('Testing compiler', () => {
  describe('Testing Redundant Needle Target Errors', () => {
    it('Testing redundant needle target', () => {
      expect(() => compiler.compile(['{a,b}', 'a']))
        .to.throw('Redundant Needle Target: "{a,b}" vs "a"');
    });

    it('Testing redundant self target (starstar)', () => {
      expect(() => compiler.compile(['**.**']))
        .to.throw('Redundant Needle Target: "**.**" vs "**.**"');
    });

    it('Mixed subsequent needle collision', () => {
      expect(() => compiler.compile(['bar', '!foo', 'foo']))
        .to.throw('Redundant Needle Target: "!foo" vs "foo"');
      expect(() => compiler.compile(['bar', 'foo', '!foo']))
        .to.throw('Redundant Needle Target: "foo" vs "!foo"');
    });

    it('Mixed spaced needle collision', () => {
      expect(() => compiler.compile(['!foo', 'bar', 'foo']))
        .to.throw('Redundant Needle Target: "!foo" vs "foo"');
      expect(() => compiler.compile(['foo', 'bar', '!foo']))
        .to.throw('Redundant Needle Target: "foo" vs "!foo"');
    });

    it('Inclusion, subsequent needle collision', () => {
      expect(() => compiler.compile(['once', 'once', '!o*']))
        .to.throw('Redundant Needle Target: "once" vs "once"');
    });

    it('Inclusion, spaced needle collision', () => {
      expect(() => compiler.compile(['once', '!o*', 'once']))
        .to.throw('Redundant Needle Target: "once" vs "once"');
    });

    it('Exclusion, subsequent needle collision', () => {
      expect(() => compiler.compile(['!once', '!once', 'o*']))
        .to.throw('Redundant Needle Target: "!once" vs "!once"');
    });

    it('Exclusion, spaced needle collision', () => {
      expect(() => compiler.compile(['!once', 'o*', '!once']))
        .to.throw('Redundant Needle Target: "!once" vs "!once"');
    });

    it('Nested Exclusion Target collision', () => {
      expect(() => compiler.compile(['a.b.c', 'a.!b.*', 'a.b.*']))
        .to.throw('Redundant Needle Target: "a.!b.*" vs "a.b.*"');
    });

    it('Testing redundant exclusion', () => {
      expect(() => compiler.compile(['!a.!b']))
        .to.throw('Redundant Exclusion: "!a.!b"');
      expect(() => compiler.compile(['{!a}.{!b}']))
        .to.throw('Redundant Exclusion: "{!a}.{!b}"');
      expect(() => compiler.compile(['{!a,c}.{!b,d}']))
        .to.throw('Redundant Exclusion: "{!a,c}.{!b,d}"');
      expect(() => compiler.compile(['[{!0,1}][{!2,3}]']))
        .to.throw('Redundant Exclusion: "[{!0,1}][{!2,3}]"');
      expect(() => compiler.compile(['!{[1][2],*,{a,b},{a.!b}}']))
        .to.throw('Redundant Exclusion: "!{[1][2],*,{a,b},{a.!b}}"');
    });
  });

  it('Testing recursion position', () => {
    const input = ['!**.a', '**'];
    const tower = compiler.compile(input);
    expect(tower).to.deep.equal({ '**': { a: {} }, a: {} });
    expect(compiler.isRecursive(tower)).to.equal(false);
    expect(compiler.isRecursive(tower['**'])).to.equal(true);
    expect(compiler.getRecursionPos(tower['**'])).to.equal(1);
    expect(compiler.isRecursive(tower['**'].a)).to.equal(false);
    expect(compiler.isRecursive(tower.a)).to.equal(false);
  });

  it('Testing recursion position for strict=false', () => {
    const input = ['**', '**.b', '!**'];
    const tower = compiler.compile(input, false);
    expect(tower).to.deep.equal({ '**': { b: {} }, b: {} });
    expect(compiler.isRecursive(tower)).to.equal(false);
    expect(compiler.isRecursive(tower['**'])).to.equal(true);
    expect(compiler.getRecursionPos(tower['**'])).to.equal(1);
    expect(compiler.isRecursive(tower['**'].b)).to.equal(false);
    expect(compiler.isRecursive(tower.b)).to.equal(false);
  });

  it('Testing similar paths', () => {
    const input = ['a.b.c.d.e', 'a.b.c.d.f'];
    const tower = compiler.compile(input);
    expect(tower).to.deep.equal({ a: { b: { c: { d: { e: {}, f: {} } } } } });
  });

  describe('Testing path component exclusion', () => {
    it('Testing forward exclusion inheritance in component path', () => {
      const input = ['{!a}.{b}'];
      const tower = compiler.compile(input);
      expect(tower).to.deep.equal({ a: { b: {} } });
      expect(compiler.hasMatches(tower)).to.equal(false);
      expect(compiler.hasMatches(tower.a)).to.equal(false);
      expect(compiler.hasMatches(tower.a.b)).to.equal(false);
    });

    it('Testing no backward exclusion inheritance in component path', () => {
      const input = ['{a}.{!b}'];
      const tower = compiler.compile(input);
      expect(tower).to.deep.equal({ a: { b: {} } });
      expect(compiler.hasMatches(tower)).to.equal(false);
      expect(compiler.hasMatches(tower.a)).to.equal(false);
      expect(compiler.hasMatches(tower.a.b)).to.equal(false);
    });
  });

  it('Testing similar paths exclusion', () => {
    const input = ['a.b.c.d.e', '!a.b.c.d.f'];
    const tower = compiler.compile(input);
    expect(tower).to.deep.equal({ a: { b: { c: { d: { e: {}, f: {} } } } } });
    expect(compiler.hasMatches(tower)).to.equal(true);
    expect(compiler.hasMatches(tower.a)).to.equal(true);
    expect(compiler.hasMatches(tower.a.b)).to.equal(true);
    expect(compiler.hasMatches(tower.a.b.c)).to.equal(true);
    expect(compiler.hasMatches(tower.a.b.c.d)).to.equal(true);
    expect(compiler.hasMatches(tower.a.b.c.d.e)).to.equal(true);
    expect(compiler.hasMatches(tower.a.b.c.d.f)).to.equal(false);
  });

  it('Testing top level exclusion', () => {
    const input = ['!a'];
    const tower = compiler.compile(input);
    expect(tower).to.deep.equal({ a: {} });
    expect(compiler.hasMatches(tower)).to.equal(false);
    expect(compiler.hasMatches(tower.a)).to.equal(false);
  });

  it('Testing Or Paths', () => {
    const input = ['{a,b.c}'];
    const tower = compiler.compile(input);
    expect(tower).to.deep.equal({
      a: {},
      b: {
        c: {}
      }
    });
  });

  it('Testing Top Level Or', () => {
    const input = ['a,b'];
    const tower = compiler.compile(input);
    expect(tower).to.deep.equal({
      a: {},
      b: {}
    });
  });

  it('Testing Nested Or', () => {
    const input = ['{a,{b,c}}'];
    const tower = compiler.compile(input);
    expect(tower).to.deep.equal({
      a: {},
      b: {},
      c: {}
    });
  });

  it('Testing Nested Or in List', () => {
    const input = ['[{1,{0,2}}]'];
    const tower = compiler.compile(input);
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
    const tower = compiler.compile(input);
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
    const tower = compiler.compile(input);
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
    const tower = compiler.compile(input);
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

  it('Testing traversing', () => {
    const input = ['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g'];
    const tower = compiler.compile(input);
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

    expect(compiler.isLeaf(tower)).to.equal(false);
    expect(compiler.isLeaf(tower.a)).to.equal(false);
    expect(compiler.isLeaf(tower.a.b)).to.equal(false);
    expect(compiler.isLeaf(tower.a.b.d)).to.equal(true);
    expect(compiler.isLeaf(tower.a.b.d.g)).to.equal(true);
    expect(compiler.isLeaf(tower.a.c)).to.equal(false);
    expect(compiler.isLeaf(tower.a.c.d)).to.equal(true);
    expect(compiler.isLeaf(tower.a.c.f)).to.equal(true);
    expect(compiler.isLeaf(tower.a.e)).to.equal(false);
    expect(compiler.isLeaf(tower.a.e.f)).to.equal(true);

    expect(compiler.isMatch(tower)).to.equal(false);
    expect(compiler.isMatch(tower.a)).to.equal(false);
    expect(compiler.isMatch(tower.a.b)).to.equal(false);
    expect(compiler.isMatch(tower.a.b.d)).to.equal(true);
    expect(compiler.isMatch(tower.a.b.d.g)).to.equal(false);
    expect(compiler.isMatch(tower.a.c)).to.equal(false);
    expect(compiler.isMatch(tower.a.c.d)).to.equal(true);
    expect(compiler.isMatch(tower.a.c.f)).to.equal(true);
    expect(compiler.isMatch(tower.a.e)).to.equal(false);
    expect(compiler.isMatch(tower.a.e.f)).to.equal(true);

    expect(compiler.hasMatches(tower)).to.equal(true);
    expect(compiler.hasMatches(tower.a)).to.equal(true);
    expect(compiler.hasMatches(tower.a.b)).to.equal(true);
    expect(compiler.hasMatches(tower.a.b.d)).to.equal(true);
    expect(compiler.hasMatches(tower.a.b.d.g)).to.equal(false);
    expect(compiler.hasMatches(tower.a.c)).to.equal(true);
    expect(compiler.hasMatches(tower.a.c.d)).to.equal(true);
    expect(compiler.hasMatches(tower.a.c.f)).to.equal(true);
    expect(compiler.hasMatches(tower.a.e)).to.equal(true);
    expect(compiler.hasMatches(tower.a.e.f)).to.equal(true);

    expect(compiler.getNeedles(tower)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
    expect(compiler.getNeedles(tower.a)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
    expect(compiler.getNeedles(tower.a.b)).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
    expect(compiler.getNeedles(tower.a.b.d)).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
    expect(compiler.getNeedles(tower.a.b.d.g)).to.deep.equal(['!a.b.d.g']);
    expect(compiler.getNeedles(tower.a.c)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f']);
    expect(compiler.getNeedles(tower.a.c.d)).to.deep.equal(['a.{b,c}.d']);
    expect(compiler.getNeedles(tower.a.c.f)).to.deep.equal(['a.{c,e}.f']);
    expect(compiler.getNeedles(tower.a.e)).to.deep.equal(['a.{c,e}.f']);
    expect(compiler.getNeedles(tower.a.e.f)).to.deep.equal(['a.{c,e}.f']);

    expect(compiler.getNeedle(tower)).to.deep.equal(null);
    expect(compiler.getNeedle(tower.a)).to.deep.equal(null);
    expect(compiler.getNeedle(tower.a.b)).to.deep.equal(null);
    expect(compiler.getNeedle(tower.a.b.d)).to.deep.equal('a.{b,c}.d');
    expect(compiler.getNeedle(tower.a.b.d.g)).to.deep.equal('!a.b.d.g');
    expect(compiler.getNeedle(tower.a.c)).to.deep.equal(null);
    expect(compiler.getNeedle(tower.a.c.d)).to.deep.equal('a.{b,c}.d');
    expect(compiler.getNeedle(tower.a.c.f)).to.deep.equal('a.{c,e}.f');
    expect(compiler.getNeedle(tower.a.e)).to.deep.equal(null);
    expect(compiler.getNeedle(tower.a.e.f)).to.deep.equal('a.{c,e}.f');

    expect(compiler.getWildcardRegex(tower)).to.deep.equal(undefined);
    expect(compiler.getWildcardRegex(tower.a)).to.deep.equal(/^a$/);
    expect(compiler.getWildcardRegex(tower.a.b)).to.deep.equal(/^b$/);
    expect(compiler.getWildcardRegex(tower.a.b.d)).to.deep.equal(/^d$/);
    expect(compiler.getWildcardRegex(tower.a.b.d.g)).to.deep.equal(/^g$/);
    expect(compiler.getWildcardRegex(tower.a.c)).to.deep.equal(/^c$/);
    expect(compiler.getWildcardRegex(tower.a.c.d)).to.deep.equal(/^d$/);
    expect(compiler.getWildcardRegex(tower.a.c.f)).to.deep.equal(/^f$/);
    expect(compiler.getWildcardRegex(tower.a.e)).to.deep.equal(/^e$/);
    expect(compiler.getWildcardRegex(tower.a.e.f)).to.deep.equal(/^f$/);

    const fixed = { context: undefined, parents: null };
    expect(compiler.getMeta([tower])).to.deep.equal({
      isMatch: false, matchedBy: [], excludedBy: [], traversedBy: ['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g'], ...fixed
    });
    expect(compiler.getMeta([tower.a])).to.deep.equal({
      isMatch: false, matchedBy: [], excludedBy: [], traversedBy: ['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g'], ...fixed
    });
    expect(compiler.getMeta([tower.a.b])).to.deep.equal({
      isMatch: false, matchedBy: [], excludedBy: [], traversedBy: ['a.{b,c}.d', '!a.b.d.g'], ...fixed
    });
    expect(compiler.getMeta([tower.a.b.d])).to.deep.equal({
      isMatch: true, matchedBy: ['a.{b,c}.d'], excludedBy: [], traversedBy: ['a.{b,c}.d', '!a.b.d.g'], ...fixed
    });
    expect(compiler.getMeta([tower.a.b.d.g])).to.deep.equal({
      isMatch: false, matchedBy: [], excludedBy: ['!a.b.d.g'], traversedBy: ['!a.b.d.g'], ...fixed
    });
    expect(compiler.getMeta([tower.a.c])).to.deep.equal({
      isMatch: false, matchedBy: [], excludedBy: [], traversedBy: ['a.{b,c}.d', 'a.{c,e}.f'], ...fixed
    });
    expect(compiler.getMeta([tower.a.c.d])).to.deep.equal({
      isMatch: true, matchedBy: ['a.{b,c}.d'], excludedBy: [], traversedBy: ['a.{b,c}.d'], ...fixed
    });
    expect(compiler.getMeta([tower.a.c.f])).to.deep.equal({
      isMatch: true, matchedBy: ['a.{c,e}.f'], excludedBy: [], traversedBy: ['a.{c,e}.f'], ...fixed
    });
    expect(compiler.getMeta([tower.a.e])).to.deep.equal({
      isMatch: false, matchedBy: [], excludedBy: [], traversedBy: ['a.{c,e}.f'], ...fixed
    });
    expect(compiler.getMeta([tower.a.e.f])).to.deep.equal({
      isMatch: true, matchedBy: ['a.{c,e}.f'], excludedBy: [], traversedBy: ['a.{c,e}.f'], ...fixed
    });
  });
});
