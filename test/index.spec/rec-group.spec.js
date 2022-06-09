import { expect } from 'chai';
import { describe } from 'node-tdd';
import objectScanOriginal from '../../src/index.js';

const objectScan = (needles, opts = {}) => objectScanOriginal(needles, { joined: true, ...opts });

describe('Testing recursive group matching', () => {
  const input = {};
  let t;
  before(() => {
    input.a = input;
    input.b = input;
    input.c = input;
    input.d = input;
    input.n = [input, input, input, input];
    input.nn = [];
    input.nn.push(input.nn, input.nn, input.nn, input.nn);
    t = (...needles) => objectScan(needles, {
      breakFn: ({ depth }) => depth > 10
    })(input);
  });

  it('Testing basic nesting', () => {
    expect(t('**{a.b.c.d}')).to.deep.equal(['a.b.c.d.a.b.c.d', 'a.b.c.d']);
    expect(t('++{a.b.c.d}')).to.deep.equal(['a.b.c.d.a.b.c.d', 'a.b.c.d']);
  });

  it('Testing zero vs one nesting', () => {
    expect(t('a.**{a.b.c.d}.a')).to.deep.equal(['a.a.b.c.d.a.b.c.d.a', 'a.a.b.c.d.a', 'a.a']);
    expect(t('a.++{a.b.c.d}.a')).to.deep.equal(['a.a.b.c.d.a.b.c.d.a', 'a.a.b.c.d.a']);
  });

  it('Testing or group is mixed in matching', () => {
    expect(t('**{a.b.c.d,d.c.b.a}')).to.deep.equal([
      'd.c.b.a.d.c.b.a',
      'd.c.b.a.a.b.c.d',
      'd.c.b.a',
      'a.b.c.d.d.c.b.a',
      'a.b.c.d.a.b.c.d',
      'a.b.c.d'
    ]);
  });

  it('Testing single or group', () => {
    expect(t('**{a}')).to.deep.equal([
      'a.a.a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a',
      'a.a.a.a.a.a',
      'a.a.a.a.a',
      'a.a.a.a',
      'a.a.a',
      'a.a',
      'a'
    ]);
  });

  it('Testing single or group with prefix', () => {
    expect(t('b.**{a}')).to.deep.equal([
      'b.a.a.a.a.a.a.a.a.a.a',
      'b.a.a.a.a.a.a.a.a.a',
      'b.a.a.a.a.a.a.a.a',
      'b.a.a.a.a.a.a.a',
      'b.a.a.a.a.a.a',
      'b.a.a.a.a.a',
      'b.a.a.a.a',
      'b.a.a.a',
      'b.a.a',
      'b.a',
      'b'
    ]);
  });

  it('Testing single or group with postfix', () => {
    expect(t('**{a}.b')).to.deep.equal([
      'b',
      'a.b',
      'a.a.b',
      'a.a.a.b',
      'a.a.a.a.b',
      'a.a.a.a.a.b',
      'a.a.a.a.a.a.b',
      'a.a.a.a.a.a.a.b',
      'a.a.a.a.a.a.a.a.b',
      'a.a.a.a.a.a.a.a.a.b',
      'a.a.a.a.a.a.a.a.a.a.b'
    ]);
  });

  it('Testing star recursion with postfix', () => {
    expect(t('**(^a$).b')).to.deep.equal([
      'b',
      'a.b',
      'a.a.b',
      'a.a.a.b',
      'a.a.a.a.b',
      'a.a.a.a.a.b',
      'a.a.a.a.a.a.b',
      'a.a.a.a.a.a.a.b',
      'a.a.a.a.a.a.a.a.b',
      'a.a.a.a.a.a.a.a.a.b',
      'a.a.a.a.a.a.a.a.a.a.b'
    ]);
  });

  it('Testing single or group with prefix and postfix', () => {
    expect(t('a.**{b}.c')).to.deep.equal([
      'a.c',
      'a.b.c',
      'a.b.b.c',
      'a.b.b.b.c',
      'a.b.b.b.b.c',
      'a.b.b.b.b.b.c',
      'a.b.b.b.b.b.b.c',
      'a.b.b.b.b.b.b.b.c',
      'a.b.b.b.b.b.b.b.b.c',
      'a.b.b.b.b.b.b.b.b.b.c'
    ]);
  });

  it('Testing redundant needle does not error', () => {
    expect(t('a.b.c.d.**{a.b.c.d,a.b.c}')).to.deep.equal([
      'a.b.c.d.a.b.c.d.a.b.c',
      'a.b.c.d.a.b.c.d',
      'a.b.c.d.a.b.c.a.b.c.d',
      'a.b.c.d.a.b.c.a.b.c',
      'a.b.c.d.a.b.c',
      'a.b.c.d'
    ]);
  });

  it('Testing long prefix and postfix with or group', () => {
    expect(t('a.b.**{a.b.c.d,d.c.b.a}.a.b')).to.deep.equal([
      'a.b.d.c.b.a.a.b',
      'a.b.a.b.c.d.a.b',
      'a.b.a.b'
    ]);
  });

  it('Testing long prefix with or group', () => {
    expect(t('a.b.**{a.b.c.d,d.c.b.a}')).to.deep.equal([
      'a.b.d.c.b.a.d.c.b.a',
      'a.b.d.c.b.a.a.b.c.d',
      'a.b.d.c.b.a',
      'a.b.a.b.c.d.d.c.b.a',
      'a.b.a.b.c.d.a.b.c.d',
      'a.b.a.b.c.d',
      'a.b'
    ]);
  });

  it('Testing long postfix with or group', () => {
    expect(t('**{a.b.c.d,d.c.b.a}.a.b')).to.deep.equal([
      'd.c.b.a.d.c.b.a.a.b',
      'd.c.b.a.a.b.c.d.a.b',
      'd.c.b.a.a.b',
      'a.b.c.d.d.c.b.a.a.b',
      'a.b.c.d.a.b.c.d.a.b',
      'a.b.c.d.a.b',
      'a.b'
    ]);
  });

  it('Testing simple postfix', () => {
    const r = t('**{a,b}.a');
    expect(r.length).to.equal(2047);
    expect(r).to.contain('a');
    expect(r).to.contain('a.a');
    expect(r).to.contain('b.a');
    expect(r).to.contain('a.b.a');
    expect(r).to.contain('b.a.a');
    expect(r).to.not.contain('a.b');
  });

  it('Testing redundant needle target', () => {
    expect(() => t('**{a,b}.a', '**{c,d}.a'))
      .to.throw('Redundant Needle Target: "**{a,b}.a" vs "**{c,d}.a"');
  });

  it('Testing escaped nested group', () => {
    expect(() => t('a.\\**{b.c}.d'))
      .to.throw('Bad Group Start: a.\\**{b.c}.d, char 5');
  });

  it('Testing complex nesting (top level simple)', () => {
    expect(t('a.b.c.d.**{a.++{b.c}.d,d.c}')).to.deep.equal([
      'a.b.c.d.d.c.d.c.d.c',
      'a.b.c.d.d.c.d.c',
      'a.b.c.d.d.c.a.b.c.d',
      'a.b.c.d.d.c',
      'a.b.c.d.a.b.c.d.d.c',
      'a.b.c.d.a.b.c.d',
      'a.b.c.d.a.b.c.b.c.d',
      'a.b.c.d'
    ]);
  });

  it('Testing double nested', () => {
    expect(t('**{++{a.b.c.d},n}')).to.deep.equal([
      'n',
      'a.b.c.d.n',
      'a.b.c.d.a.b.c.d.n',
      'a.b.c.d.a.b.c.d',
      'a.b.c.d'
    ]);
  });

  it('Testing complex nesting (top level)', () => {
    expect(t('**{a.b.c.++{b.c}.d,a.b.c.d}')).to.deep.equal([
      'a.b.c.d.a.b.c.d',
      'a.b.c.d.a.b.c.b.c.d',
      'a.b.c.d',
      'a.b.c.b.c.d.a.b.c.d',
      'a.b.c.b.c.d',
      'a.b.c.b.c.b.c.d',
      'a.b.c.b.c.b.c.b.c.d'
    ]);
  });

  it('Testing nested arrays with keys', () => {
    expect(t('**{n[{1,2}].n[0].n[*]}')).to.deep.equal([
      'n[2].n[0].n[3]',
      'n[2].n[0].n[2]',
      'n[2].n[0].n[1]',
      'n[2].n[0].n[0]',
      'n[1].n[0].n[3]',
      'n[1].n[0].n[2]',
      'n[1].n[0].n[1]',
      'n[1].n[0].n[0]'
    ]);
  });

  it('Testing nested arrays without keys', () => {
    expect(t('nn.**{[{1,2}][0][*]}[1][2][3][0][1][2][3]')).to.deep.equal([
      'nn[2][0][3][1][2][3][0][1][2][3]',
      'nn[2][0][2][1][2][3][0][1][2][3]',
      'nn[2][0][1][1][2][3][0][1][2][3]',
      'nn[2][0][0][1][2][3][0][1][2][3]',
      'nn[1][2][3][0][1][2][3]',
      'nn[1][0][3][1][2][3][0][1][2][3]',
      'nn[1][0][2][1][2][3][0][1][2][3]',
      'nn[1][0][1][1][2][3][0][1][2][3]',
      'nn[1][0][0][1][2][3][0][1][2][3]'
    ]);
  });

  it('Testing empty group throws error', () => {
    expect(() => t('**{}')).to.throw('Bad Group Terminator: **{}, char 3');
  });

  it('Testing redundant group nested', () => {
    expect(t('{a.b.c.d,c.d.b.a}.**{c,d}.{a.b.c.d.a,d.c.b.a.d}')).to.deep.equal([
      'c.d.b.a.d.d.d.c.b.a.d',
      'c.d.b.a.d.d.c.b.a.d',
      'c.d.b.a.d.d.a.b.c.d.a',
      'c.d.b.a.d.c.d.c.b.a.d',
      'c.d.b.a.d.c.b.a.d',
      'c.d.b.a.d.c.a.b.c.d.a',
      'c.d.b.a.d.a.b.c.d.a',
      'c.d.b.a.c.d.d.c.b.a.d',
      'c.d.b.a.c.d.c.b.a.d',
      'c.d.b.a.c.d.a.b.c.d.a',
      'c.d.b.a.c.c.d.c.b.a.d',
      'c.d.b.a.c.c.a.b.c.d.a',
      'c.d.b.a.c.a.b.c.d.a',
      'c.d.b.a.a.b.c.d.a',
      'a.b.c.d.d.d.d.c.b.a.d',
      'a.b.c.d.d.d.c.b.a.d',
      'a.b.c.d.d.d.a.b.c.d.a',
      'a.b.c.d.d.c.d.c.b.a.d',
      'a.b.c.d.d.c.b.a.d',
      'a.b.c.d.d.c.a.b.c.d.a',
      'a.b.c.d.d.a.b.c.d.a',
      'a.b.c.d.c.d.d.c.b.a.d',
      'a.b.c.d.c.d.c.b.a.d',
      'a.b.c.d.c.d.a.b.c.d.a',
      'a.b.c.d.c.c.d.c.b.a.d',
      'a.b.c.d.c.c.a.b.c.d.a',
      'a.b.c.d.c.a.b.c.d.a',
      'a.b.c.d.a.b.c.d.a'
    ]);
  });

  it('Deeply nested recursion', () => {
    const data = [[[[[[[[[[1]]]]]]]]]];
    const needles = ['++{++{**}}.++'];
    const r = objectScan(needles, {
      rtn: 'matchedBy',
      filterFn: ({ isLeaf }) => isLeaf
    })(data);
    expect(r).to.deep.equal([['++{++{**}}.++']]);
  });

  it('Nested Path with exclude starstar', () => {
    expect(t('**{a.b},!**{a.b.a.b}')).to.deep.equal([
      'a.b.a.b.a.b.a.b.a.b',
      'a.b.a.b.a.b',
      'a.b'
    ]);
  });

  it('Nested Path with exclude plusplus', () => {
    expect(t('++{a.b},!++{a.b.a.b}')).to.deep.equal([
      'a.b.a.b.a.b.a.b.a.b',
      'a.b.a.b.a.b',
      'a.b'
    ]);
  });

  it('Nested Path with double exclude starstar', () => {
    expect(t('**{a},!**{a.a}')).to.deep.equal([
      'a.a.a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a',
      'a.a.a.a.a',
      'a.a.a',
      'a'
    ]);
  });

  it('Nested Path with double exclude plusplus', () => {
    expect(t('++{a},!++{a.a}')).to.deep.equal([
      'a.a.a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a',
      'a.a.a.a.a',
      'a.a.a',
      'a'
    ]);
  });

  it('Basic or logic starstar', () => {
    expect(t('**{a.b.c}', '{a.b.c.d}')).to.deep.equal([
      'a.b.c.d',
      'a.b.c.a.b.c.a.b.c',
      'a.b.c.a.b.c',
      'a.b.c'
    ]);
  });

  it('Basic or logic plusplus', () => {
    expect(t('++{a.b.c}', '{a.b.c.d}')).to.deep.equal([
      'a.b.c.d',
      'a.b.c.a.b.c.a.b.c',
      'a.b.c.a.b.c',
      'a.b.c'
    ]);
  });

  it('Basic rec star and exclusion', () => {
    expect(t('**(^a$)', '!**{a.a}')).to.deep.equal([
      'a.a.a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a',
      'a.a.a.a.a',
      'a.a.a',
      'a'
    ]);
  });

  it('Basic two nested groups', () => {
    expect(t('**{a.a.a.a}', '**{b.b.b.b}')).to.deep.equal([
      'b.b.b.b.b.b.b.b',
      'b.b.b.b',
      'a.a.a.a.a.a.a.a',
      'a.a.a.a'
    ]);
  });

  it('Nested group, single element', () => {
    expect(t('++{++{++{a}}}')).to.deep.equal([
      'a.a.a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a',
      'a.a.a.a.a.a',
      'a.a.a.a.a',
      'a.a.a.a',
      'a.a.a',
      'a.a',
      'a'
    ]);
  });

  it('Nested group, single element, prefix', () => {
    expect(t('b.++{++{++{a}}}')).to.deep.equal([
      'b.a.a.a.a.a.a.a.a.a.a',
      'b.a.a.a.a.a.a.a.a.a',
      'b.a.a.a.a.a.a.a.a',
      'b.a.a.a.a.a.a.a',
      'b.a.a.a.a.a.a',
      'b.a.a.a.a.a',
      'b.a.a.a.a',
      'b.a.a.a',
      'b.a.a',
      'b.a'
    ]);
  });

  it('Nested group, single element, prefix and postfix', () => {
    expect(t('b.++{++{++{a}}}.c')).to.deep.equal([
      'b.a.c',
      'b.a.a.c',
      'b.a.a.a.c',
      'b.a.a.a.a.c',
      'b.a.a.a.a.a.c',
      'b.a.a.a.a.a.a.c',
      'b.a.a.a.a.a.a.a.c',
      'b.a.a.a.a.a.a.a.a.c',
      'b.a.a.a.a.a.a.a.a.a.c'
    ]);
  });

  it('Nested group, single element, postfix', () => {
    expect(t('++{++{++{a}}}.c')).to.deep.equal([
      'a.c',
      'a.a.c',
      'a.a.a.c',
      'a.a.a.a.c',
      'a.a.a.a.a.c',
      'a.a.a.a.a.a.c',
      'a.a.a.a.a.a.a.c',
      'a.a.a.a.a.a.a.a.c',
      'a.a.a.a.a.a.a.a.a.c',
      'a.a.a.a.a.a.a.a.a.a.c'
    ]);
  });

  it('Nested group, two element', () => {
    expect(t('++{++{++{a.a}}}')).to.deep.equal([
      'a.a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a',
      'a.a.a.a',
      'a.a'
    ]);
  });

  it('Nested group, two element, prefix', () => {
    expect(t('b.++{++{++{a.a}}}')).to.deep.equal([
      'b.a.a.a.a.a.a.a.a.a.a',
      'b.a.a.a.a.a.a.a.a',
      'b.a.a.a.a.a.a',
      'b.a.a.a.a',
      'b.a.a'
    ]);
  });

  it('Nested group, two element, prefix and postfix', () => {
    expect(t('b.++{++{++{a.a}}}.c')).to.deep.equal([
      'b.a.a.c',
      'b.a.a.a.a.c',
      'b.a.a.a.a.a.a.c',
      'b.a.a.a.a.a.a.a.a.c'
    ]);
  });

  it('Nested group, two element, postfix', () => {
    expect(t('++{++{++{a.a}}}.c')).to.deep.equal([
      'a.a.c',
      'a.a.a.a.c',
      'a.a.a.a.a.a.c',
      'a.a.a.a.a.a.a.a.c',
      'a.a.a.a.a.a.a.a.a.a.c'
    ]);
  });

  it('Basic multiple recursive star regex', () => {
    expect(t('**(^a$)', '**(^b$)')).to.deep.equal([
      'b.b.b.b.b.b.b.b.b.b.b',
      'b.b.b.b.b.b.b.b.b.b',
      'b.b.b.b.b.b.b.b.b',
      'b.b.b.b.b.b.b.b',
      'b.b.b.b.b.b.b',
      'b.b.b.b.b.b',
      'b.b.b.b.b',
      'b.b.b.b',
      'b.b.b',
      'b.b',
      'b',
      'a.a.a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a.a',
      'a.a.a.a.a.a.a',
      'a.a.a.a.a.a',
      'a.a.a.a.a',
      'a.a.a.a',
      'a.a.a',
      'a.a',
      'a'
    ]);
  });

  it('Testing starstar in recursive group matches skip', () => {
    expect(t('a.a.a.a.a.a.a.a.a.a.++{**}')).to.deep.equal([
      'a.a.a.a.a.a.a.a.a.a.nn',
      'a.a.a.a.a.a.a.a.a.a.n',
      'a.a.a.a.a.a.a.a.a.a.d',
      'a.a.a.a.a.a.a.a.a.a.c',
      'a.a.a.a.a.a.a.a.a.a.b',
      'a.a.a.a.a.a.a.a.a.a.a'
    ]);
  });

  it('Testing rec plus group containing starstar', () => {
    const r = objectScan(['a.++{**}'])({ a: { b: { c: 0 } } });
    expect(r).to.deep.equal(['a.b.c', 'a.b']);
  });

  it('Testing rec star group containing starstar', () => {
    const r = objectScan(['a.**{**}'])({ a: { b: { c: 0 } } });
    expect(r).to.deep.equal(['a.b.c', 'a.b', 'a']);
  });

  it('Testing large recursive needle', () => {
    const r = objectScan([
      '**.**{[0].**[0].**[0].**{**[0].again.**.frighten[0].**.nativf.**.parallel.**.for.**}}'
    ])({});
    expect(r).to.deep.equal([]);
  });

  it('Testing Wildcard target used for recursion', () => {
    const r = objectScan(
      ['a.**{b.**.**}'],
      { strict: false }
    )({ a: { b: { b: { b: 0 }, c: { d: 1 } } } });
    expect(r).to.deep.equal([
      'a.b.c.d',
      'a.b.c',
      'a.b.b.b',
      'a.b.b',
      'a.b',
      'a'
    ]);
  });

  it('Testing second needle does not pollute rec group postfix', () => {
    const r = objectScan(['a.**{b,c}.a', 'a.b.d'], {
      strict: false,
      breakFn: ({ depth }) => depth > 3
    })(input);
    expect(r).to.deep.equal([
      'a.c.c.a',
      'a.c.b.a',
      'a.c.a',
      'a.b.d',
      'a.b.c.a',
      'a.b.b.a',
      'a.b.a',
      'a.a'
    ]);
  });
});
