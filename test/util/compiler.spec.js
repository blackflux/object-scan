const expect = require('chai').expect;
const compiler = require('./../../src/util/compiler');

describe('Testing compiler', () => {
  it('Testing redundant needle target', () => {
    const input = ['{a,b}', 'a'];
    expect(() => compiler.compile(input)).to.throw('Redundant Needle Target: "{a,b}" vs "a"');
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
      'a*': { b: {} }
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
    console.log(JSON.stringify(tower));
    expect(tower).to.deep.equal({
      '[0]': { '[1]': {} },
      '**': { '[1]': {} },
      '[*]': { '[1]': {} },
      '[*0]': { '[1]': {} },
      '[0*]': { '[1]': {} }
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
    const input = ['a.{b,c}.d', 'a.{c,e}.f', 'a.b.d.g'];
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

    expect(compiler.isMatch(tower)).to.equal(false);
    expect(compiler.isMatch(tower.a)).to.equal(false);
    expect(compiler.isMatch(tower.a.b)).to.equal(false);
    expect(compiler.isMatch(tower.a.b.d)).to.equal(true);
    expect(compiler.isMatch(tower.a.b.d.g)).to.equal(true);
    expect(compiler.isMatch(tower.a.c)).to.equal(false);
    expect(compiler.isMatch(tower.a.c.d)).to.equal(true);
    expect(compiler.isMatch(tower.a.c.f)).to.equal(true);
    expect(compiler.isMatch(tower.a.e)).to.equal(false);
    expect(compiler.isMatch(tower.a.e.f)).to.equal(true);

    expect(compiler.getNeedles(tower)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', 'a.b.d.g']);
    expect(compiler.getNeedles(tower.a)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', 'a.b.d.g']);
    expect(compiler.getNeedles(tower.a.b)).to.deep.equal(['a.{b,c}.d', 'a.b.d.g']);
    expect(compiler.getNeedles(tower.a.b.d)).to.deep.equal(['a.{b,c}.d', 'a.b.d.g']);
    expect(compiler.getNeedles(tower.a.b.d.g)).to.deep.equal(['a.b.d.g']);
    expect(compiler.getNeedles(tower.a.c)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f']);
    expect(compiler.getNeedles(tower.a.c.d)).to.deep.equal(['a.{b,c}.d']);
    expect(compiler.getNeedles(tower.a.c.f)).to.deep.equal(['a.{c,e}.f']);
    expect(compiler.getNeedles(tower.a.e)).to.deep.equal(['a.{c,e}.f']);
    expect(compiler.getNeedles(tower.a.e.f)).to.deep.equal(['a.{c,e}.f']);

    expect(compiler.getNeedle(tower)).to.deep.equal(null);
    expect(compiler.getNeedle(tower.a)).to.deep.equal(null);
    expect(compiler.getNeedle(tower.a.b)).to.deep.equal(null);
    expect(compiler.getNeedle(tower.a.b.d)).to.deep.equal('a.{b,c}.d');
    expect(compiler.getNeedle(tower.a.b.d.g)).to.deep.equal('a.b.d.g');
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

    expect(compiler.getMeta([tower])).to.deep.equal({
      isMatch: false, matches: [], needles: ['a.{b,c}.d', 'a.{c,e}.f', 'a.b.d.g'], parents: null
    });
    expect(compiler.getMeta([tower.a])).to.deep.equal({
      isMatch: false, matches: [], needles: ['a.{b,c}.d', 'a.{c,e}.f', 'a.b.d.g'], parents: null
    });
    expect(compiler.getMeta([tower.a.b])).to.deep.equal({
      isMatch: false, matches: [], needles: ['a.{b,c}.d', 'a.b.d.g'], parents: null
    });
    expect(compiler.getMeta([tower.a.b.d])).to.deep.equal({
      isMatch: true, matches: ['a.{b,c}.d'], needles: ['a.{b,c}.d', 'a.b.d.g'], parents: null
    });
    expect(compiler.getMeta([tower.a.b.d.g])).to.deep.equal({
      isMatch: true, matches: ['a.b.d.g'], needles: ['a.b.d.g'], parents: null
    });
    expect(compiler.getMeta([tower.a.c])).to.deep.equal({
      isMatch: false, matches: [], needles: ['a.{b,c}.d', 'a.{c,e}.f'], parents: null
    });
    expect(compiler.getMeta([tower.a.c.d])).to.deep.equal({
      isMatch: true, matches: ['a.{b,c}.d'], needles: ['a.{b,c}.d'], parents: null
    });
    expect(compiler.getMeta([tower.a.c.f])).to.deep.equal({
      isMatch: true, matches: ['a.{c,e}.f'], needles: ['a.{c,e}.f'], parents: null
    });
    expect(compiler.getMeta([tower.a.e])).to.deep.equal({
      isMatch: false, matches: [], needles: ['a.{c,e}.f'], parents: null
    });
    expect(compiler.getMeta([tower.a.e.f])).to.deep.equal({
      isMatch: true, matches: ['a.{c,e}.f'], needles: ['a.{c,e}.f'], parents: null
    });
  });
});
