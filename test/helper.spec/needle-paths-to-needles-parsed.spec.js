const expect = require('chai').expect;
const { describe } = require('node-tdd');
const pathToNeedlePath = require('../helper/path-to-needle-path');
const needlePathsToNeedlesParsed = require('../helper/needle-paths-to-needles-parsed');
const parsedNeedleToString = require('../helper/parsed-needle-to-string');

describe('Testing needle-paths-to-needles-parsed.js', () => {
  let params;
  beforeEach(() => {
    params = {
      exclude: false,
      lenPercentage: 1,
      questionMark: 0,
      partialStar: 0,
      singleStar: 0,
      doubleStar: 0
    };
  });

  it('Testing single', () => {
    const needlePath = pathToNeedlePath(['name', 0, 'value', 16, 'property'], params);
    const r = needlePathsToNeedlesParsed([needlePath]);
    expect(parsedNeedleToString(r)).to.deep.equal('{name[0].value[16].property}');
  });

  it('Testing exclude', () => {
    const needlePath = pathToNeedlePath(['name', 0, 'value', 16, 'property'], params);
    needlePath[3].exclude = true;
    const r = needlePathsToNeedlesParsed([needlePath]);
    expect(parsedNeedleToString(r)).to.deep.equal('{name[0].value[!16].property}');
  });

  it('Testing identical', () => {
    const needlePath = pathToNeedlePath(['name', 0, 'value', 16, 'property'], params);
    const r = needlePathsToNeedlesParsed([needlePath, needlePath]);
    expect(parsedNeedleToString(r)).to.deep.equal('{name[0].value[16].property}');
  });

  it('Testing center, same diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 16, 'property'], params);
    const needlePathB = pathToNeedlePath(['name', 0, 'other', 16, 'property'], params);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{name[0].{value,other}[16].property}');
  });

  it('Testing center, different diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'a', 16, 'property'], params);
    const needlePathB = pathToNeedlePath(['name', 0, 'b', 'c', 16, 'property'], params);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{name[0].{a,{b.c}}[16].property}');
  });

  it('Testing start, same diff length', () => {
    const needlePathA = pathToNeedlePath(['a', 0, 'value', 16, 'property'], params);
    const needlePathB = pathToNeedlePath(['b', 0, 'value', 16, 'property'], params);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{{a,b}[0].value[16].property}');
  });

  it('Testing start, different diff length', () => {
    const needlePathA = pathToNeedlePath(['a', 0, 'value', 16, 'property'], params);
    const needlePathB = pathToNeedlePath(['b', 'c', 0, 'value', 16, 'property'], params);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{{a,{b.c}}[0].value[16].property}');
  });

  it('Testing end, same diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 16, 'a'], params);
    const needlePathB = pathToNeedlePath(['name', 0, 'value', 16, 'b'], params);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{name[0].value[16].{a,b}}');
  });

  it('Testing end, different diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 16, 'a'], params);
    const needlePathB = pathToNeedlePath(['name', 0, 'value', 16, 'b', 'c'], params);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{name[0].value[16].{a,{b.c}}}');
  });

  it('Testing disjoint needles', () => {
    const needlePathA = pathToNeedlePath(['a', 'b'], params);
    const needlePathB = pathToNeedlePath(['c', 'd'], params);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToString(r)).to.deep.equal('{{a.b},{c.d}}');
  });

  it('Testing best match merge', () => {
    const needlePathA = pathToNeedlePath(['a', 'b', 'c', 'd', 'e'], params);
    const needlePathB = pathToNeedlePath(['f', 'g', 'h', 'i', 'j'], params);
    const needlePathC = pathToNeedlePath(['a', 'b', 'h', 'i', 'j'], params);
    const needlePathD = pathToNeedlePath(['a', 'b', 'k', 'd', 'e'], params);
    const needlePathE = pathToNeedlePath(['a', 'b', 'l', 'd', 'e'], params);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB, needlePathC, needlePathD, needlePathE]);
    expect(parsedNeedleToString(r)).to.deep.equal('{{a.b.{c,k,l}.d.e},{{{f.g},{a.b}}.h.i.j}}');
  });
});
