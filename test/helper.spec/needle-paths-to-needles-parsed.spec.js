import { describe } from 'node-tdd';
import { expect } from 'chai';
import pathToNeedlePath from '../helper/path-to-needle-path.js';
import needlePathsToNeedlesParsed from '../helper/needle-paths-to-needles-parsed.js';
import parsedNeedleToStringArray from '../helper/parsed-needle-to-string-array.js';
import generateDataset from '../helper/generate-dataset.js';
import callSignature from '../helper/call-signature.js';
import objectScan from '../../src/index.js';

describe('Testing needle-paths-to-needles-parsed.js', { timeout: 5000 }, () => {
  it('Testing single', () => {
    const needlePath = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePath]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['name[0].value[16].property']);
  });

  it('Testing empty array', () => {
    const r = needlePathsToNeedlesParsed([[]]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['']);
  });

  it('Testing exclude', () => {
    const needlePath = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    needlePath[3].exclude = true;
    const r = needlePathsToNeedlesParsed([needlePath]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal([
      'name[0].value[!16].property'
    ]);
  });

  it('Testing identical', () => {
    const needlePath = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePath, needlePath]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['name[0].value[16].property']);
  });

  it('Testing nested needle merging', () => {
    const r = needlePathsToNeedlesParsed([
      pathToNeedlePath([0, '1']),
      pathToNeedlePath([1, 0, 0]),
      pathToNeedlePath([1, 1, 0, 0]),
      pathToNeedlePath([1, 1, 0, 1, 0]),
      pathToNeedlePath([1, 1, 0, 1, 1])
    ]);
    expect(parsedNeedleToStringArray(r))
      .to.deep.equal([
        '[0].1',
        '[1].{[0][0],[1][0].{[0],[1].{[0],[1]}}}'
      ]);
  });

  it('Testing simplify needles internally (simple)', () => {
    const r = needlePathsToNeedlesParsed([
      pathToNeedlePath([1, 0]),
      pathToNeedlePath([1, 2, 0]),
      pathToNeedlePath([1, 2, 1])
    ]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['[1].{[0],[2].{[0],[1]}}']);
  });

  it('Testing simplify needles internally (complex)', () => {
    const r = needlePathsToNeedlesParsed([
      pathToNeedlePath([0]),
      pathToNeedlePath([1, 0]),
      pathToNeedlePath([2, 'Z', 0]),
      pathToNeedlePath([2, 'Z', 1, 0]),
      pathToNeedlePath([2, 'Z', 1, 1])
    ]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal([
      '[0]',
      '[1][0]',
      '[2].Z.{[0],[1].{[0],[1]}}'
    ]);
  });

  it('Testing zero length diff (additive)', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 'property']);
    const needlePathB = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['name[0].value.{property,[16].property}']);
  });

  it('Testing zero length diff (subtractive)', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    const needlePathB = pathToNeedlePath(['name', 0, 'value', 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['name[0].value.{[16].property,property}']);
  });

  it('Testing zero length diff (additive, similar)', () => {
    const needlePathA = pathToNeedlePath(['A', 1, 0]);
    const needlePathB = pathToNeedlePath(['A', 1, 1, 0]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['A[1].{[0],[1][0]}']);
  });

  it('Testing zero length diff (subtractive, similar)', () => {
    const needlePathA = pathToNeedlePath(['A', 1, 1, 0]);
    const needlePathB = pathToNeedlePath(['A', 1, 0]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['A[1].{[1][0],[0]}']);
  });

  it('Testing zero length diff (tail overlap of one)', () => {
    const needlePathA = pathToNeedlePath([0, 0, 0]);
    const needlePathB = pathToNeedlePath([0, 0, 1, 0, 0]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['[0][0].{[0],[1][0][0]}']);
  });

  it('Testing zero length diff (tail overlap of two)', () => {
    const needlePathA = pathToNeedlePath([0, 0, 0, 0]);
    const needlePathB = pathToNeedlePath([0, 0, 1, 0, 0]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['[0][0].{[0],[1][0]}[0]']);
  });

  it('Testing zero length diff (full overlap end)', () => {
    const needlePathA = pathToNeedlePath([0, 0]);
    const needlePathB = pathToNeedlePath([1, 0, 0]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['{[0],[1][0]}[0]']);
  });

  it('Testing zero length diff (full overlap start)', () => {
    const needlePathA = pathToNeedlePath(['f', 1, 2]);
    const needlePathB = pathToNeedlePath(['f', 1]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['f.{[1][2],[1]}']);
  });

  it('Testing symmetric overlap', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 'property']);
    const needlePathB = pathToNeedlePath(['value', 'property', 'other']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal([
      'name[0].value.property',
      'value.property.other'
    ]);
  });

  it('Testing center, same diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 16, 'property']);
    const needlePathB = pathToNeedlePath(['name', 0, 'other', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['name[0].{value,other}[16].property']);
  });

  it('Testing center, different diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'a', 16, 'property']);
    const needlePathB = pathToNeedlePath(['name', 0, 'b', 'c', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['name[0].{a,b.c}[16].property']);
  });

  it('Testing start, same diff length', () => {
    const needlePathA = pathToNeedlePath(['a', 0, 'value', 16, 'property']);
    const needlePathB = pathToNeedlePath(['b', 0, 'value', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['{a,b}[0].value[16].property']);
  });

  it('Testing start, different diff length', () => {
    const needlePathA = pathToNeedlePath(['a', 0, 'value', 16, 'property']);
    const needlePathB = pathToNeedlePath(['b', 'c', 0, 'value', 16, 'property']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['{a,b.c}[0].value[16].property']);
  });

  it('Testing end, same diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 16, 'a']);
    const needlePathB = pathToNeedlePath(['name', 0, 'value', 16, 'b']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['name[0].value[16].{a,b}']);
  });

  it('Testing end, different diff length', () => {
    const needlePathA = pathToNeedlePath(['name', 0, 'value', 16, 'a']);
    const needlePathB = pathToNeedlePath(['name', 0, 'value', 16, 'b', 'c']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['name[0].value[16].{a,b.c}']);
  });

  it('Testing disjoint needles', () => {
    const needlePathA = pathToNeedlePath(['a', 'b']);
    const needlePathB = pathToNeedlePath(['c', 'd']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['a.b', 'c.d']);
  });

  it('Testing best match merge (string)', () => {
    const needlePathA = pathToNeedlePath(['a', 'b', 'c', 'd', 'e']);
    const needlePathB = pathToNeedlePath(['f', 'g', 'h', 'i', 'j']);
    const needlePathC = pathToNeedlePath(['a', 'b', 'h', 'i', 'j']);
    const needlePathD = pathToNeedlePath(['a', 'b', 'k', 'd', 'e']);
    const needlePathE = pathToNeedlePath(['a', 'b', 'l', 'd', 'e']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB, needlePathC, needlePathD, needlePathE]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal([
      'a.b.{c,k,l}.d.e',
      '{f.g,a.b}.h.i.j'
    ]);
  });

  it('Testing no merge across exclude', () => {
    const needlePathA = pathToNeedlePath(['a', 'b']);
    const needlePathB = pathToNeedlePath(['a', 'b']);
    const needlePathC = pathToNeedlePath(['a', 'c']);
    const needlePathD = pathToNeedlePath(['a', 'b']);
    needlePathB[1].exclude = true;
    needlePathC[1].exclude = true;
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB, needlePathC, needlePathD]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['a.b', 'a.!{b,c}', 'a.b']);
  });

  it('Testing merge order (identical path)', () => {
    const needlePathA = pathToNeedlePath(['a', 'b']);
    const needlePathB = pathToNeedlePath(['a', 'c']);
    const needlePathC = pathToNeedlePath(['a', 'b']);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB, needlePathC]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['a.{b,c}']);
  });

  it('Testing merge order (subset path)', () => {
    const needlePathA = pathToNeedlePath(['a', 'b']);
    const needlePathB = pathToNeedlePath(['a', 'c']);
    const needlePathC = pathToNeedlePath(['a', 'b', 9]);
    const r = needlePathsToNeedlesParsed([needlePathA, needlePathB, needlePathC]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal(['a.{b,b[9],c}']);
  });

  it('Testing correctness of needle merging', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const { rng, paths, haystack } = generateDataset();
      const needlePaths = paths.map((p) => pathToNeedlePath(p, {
        lenPercentage: rng() > 0.1 ? rng() : 1,
        questionMark: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        partialPlus: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        partialStar: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        singleStar: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        doublePlus: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        doubleStar: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        regex: rng() > 0.1 ? 0 : Math.floor(rng() * p.length) + 1,
        exclude: rng() > 0.9,
        shuffle: rng() > 0.9
      }, rng));

      const needles1 = needlePaths.reduce((p, c) => {
        const parsed = needlePathsToNeedlesParsed([c]);
        p.push(parsedNeedleToStringArray(parsed)[0]);
        return p;
      }, []);

      const needlesParsed2 = needlePathsToNeedlesParsed(needlePaths);
      const needles2 = parsedNeedleToStringArray(needlesParsed2);

      const { result: result1 } = callSignature({ objectScan, haystack, needles: needles1 });
      const { result: result2 } = callSignature({ objectScan, haystack, needles: needles2 });

      expect(result1, `Seed: ${rng.seed}`).to.deep.equal(result2);
    }
  });
});
