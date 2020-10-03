const expect = require('chai').expect;
const { describe } = require('node-tdd');
const pathToNeedlePath = require('../helper/path-to-needle-path');
const needlePathsToNeedlesParsed = require('../helper/needle-paths-to-needles-parsed');
const parsedNeedleToString = require('../helper/parsed-needle-to-string');

describe('Testing needle-paths-to-needles-parsed.js', () => {
  it('Testing single', () => {
    const needlePath = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePath]);
    expect(parsedNeedleToString(r)).to.deep.equal('name[0].value[16].property');
  });

  it('Testing exclude', () => {
    const needlePath = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    needlePath[3].exclude = true;
    const r = needlePathsToNeedlesParsed([needlePath]);
    expect(parsedNeedleToString(r)).to.deep.equal('name[0].value[!16].property');
  });

  it('Testing identical', () => {
    const needlePath = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePath, needlePath]);
    expect(parsedNeedleToString(r)).to.deep.equal('name[0].value[16].property');
  });

  it('Testing nested needle merging', () => {
    const r = needlePathsToNeedlesParsed([
      pathToNeedlePath([0, '1']),
      pathToNeedlePath([1, 0, 0]),
      pathToNeedlePath([1, 1, 0, 0]),
      pathToNeedlePath([1, 1, 0, 1, 0]),
      pathToNeedlePath([1, 1, 0, 1, 1])
    ]);
    expect(parsedNeedleToString(r))
      .to.deep.equal('{[0].1,[1].{{[0],[1].{[0],[0][1]}}[0],[1][0][1][1]}}');
  });

  it('Testing simplify needles internally (simple)', () => {
    const r = needlePathsToNeedlesParsed([
      pathToNeedlePath([1, 0]),
      pathToNeedlePath([1, 2, 0]),
      pathToNeedlePath([1, 2, 1])
    ]);
    expect(parsedNeedleToString(r)).to.deep.equal('[1].{[0],[2].{[0],[1]}}');
  });

  it('Testing simplify needles internally (complex)', () => {
    const r = needlePathsToNeedlesParsed([
      pathToNeedlePath([0]),
      pathToNeedlePath([1, 0]),
      pathToNeedlePath([2, 'Z', 0]),
      pathToNeedlePath([2, 'Z', 1, 0]),
      pathToNeedlePath([2, 'Z', 1, 1])
    ]);
    expect(parsedNeedleToString(r)).to.deep.equal('{[0],{[1],[2].{Z,Z[1]}}[0],[2].Z[1][1]}');
  });

  it('Testing zero length diff (additive)', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 'property']);
    const needlePathB = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('name[0].value.{property,[16].property}');
  });

  it('Testing zero length diff (subtractive)', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    const needlePathB = pathToNeedlePath(['name', 0, 'value', 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('name[0].value.{[16].property,property}');
  });

  it('Testing zero length diff (additive, similar)', () => {
    const needlePathA = pathToNeedlePath(['A', 1, 0]);
    const needlePathB = pathToNeedlePath(['A', 1, 1, 0]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('A[1].{[0],[1][0]}');
  });

  it('Testing zero length diff (subtractive, similar)', () => {
    const needlePathA = pathToNeedlePath(['A', 1, 1, 0]);
    const needlePathB = pathToNeedlePath(['A', 1, 0]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('A[1].{[1][0],[0]}');
  });

  it('Testing zero length diff (tail overlap of one)', () => {
    const needlePathA = pathToNeedlePath([0, 0, 0]);
    const needlePathB = pathToNeedlePath([0, 0, 1, 0, 0]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('[0][0].{[0],[1][0][0]}');
  });

  it('Testing zero length diff (tail overlap of two)', () => {
    const needlePathA = pathToNeedlePath([0, 0, 0, 0]);
    const needlePathB = pathToNeedlePath([0, 0, 1, 0, 0]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('[0][0].{[0],[1][0]}[0]');
  });

  it('Testing zero length diff (full overlap end)', () => {
    const needlePathA = pathToNeedlePath([0, 0]);
    const needlePathB = pathToNeedlePath([1, 0, 0]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{[0],[1][0]}[0]');
  });

  it('Testing zero length diff (full overlap start)', () => {
    const needlePathA = pathToNeedlePath(['f', 1, 2]);
    const needlePathB = pathToNeedlePath(['f', 1]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('f.{[1][2],[1]}');
  });

  it('Testing symmetric overlap', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 'property']);
    const needlePathB = pathToNeedlePath(['value', 'property', 'other']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{name[0].value.property,value.property.other}');
  });

  it('Testing center, same diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    const needlePathB = pathToNeedlePath(['name', 0, 'other', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('name[0].{value,other}[16].property');
  });

  it('Testing center, different diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'a', 16, 'property']);
    const needlePathB = pathToNeedlePath(['name', 0, 'b', 'c', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('name[0].{a,b.c}[16].property');
  });

  it('Testing start, same diff length', () => {
    const needlePathA = pathToNeedlePath(['a', 0, 'value', 16, 'property']);
    const needlePathB = pathToNeedlePath(['b', 0, 'value', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{a,b}[0].value[16].property');
  });

  it('Testing start, different diff length', () => {
    const needlePathA = pathToNeedlePath(['a', 0, 'value', 16, 'property']);
    const needlePathB = pathToNeedlePath(['b', 'c', 0, 'value', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{a,b.c}[0].value[16].property');
  });

  it('Testing end, same diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 16, 'a']);
    const needlePathB = pathToNeedlePath(['name', 0, 'value', 16, 'b']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('name[0].value[16].{a,b}');
  });

  it('Testing end, different diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 16, 'a']);
    const needlePathB = pathToNeedlePath(['name', 0, 'value', 16, 'b', 'c']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('name[0].value[16].{a,b.c}');
  });

  it('Testing disjoint needles', () => {
    const needlePathA = pathToNeedlePath(['a', 'b']);
    const needlePathB = pathToNeedlePath(['c', 'd']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{a.b,c.d}');
  });

  it('Testing best match merge (string)', () => {
    const needlePathA = pathToNeedlePath(['a', 'b', 'c', 'd', 'e']);
    const needlePathB = pathToNeedlePath(['f', 'g', 'h', 'i', 'j']);
    const needlePathC = pathToNeedlePath(['a', 'b', 'h', 'i', 'j']);
    const needlePathD = pathToNeedlePath(['a', 'b', 'k', 'd', 'e']);
    const needlePathE = pathToNeedlePath(['a', 'b', 'l', 'd', 'e']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB, needlePathC, needlePathD, needlePathE]);
    expect(parsedNeedleToString(r)).to.deep.equal('{a.b.{c,k,l}.d.e,{f.g,a.b}.h.i.j}');
  });
});
