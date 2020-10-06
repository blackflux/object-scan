const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateParsedNeedle = require('../helper/generate-parsed-needle');
const parsedNeedleToStringArray = require('../helper/parsed-needle-to-string-array');
const generateDataset = require('../helper/generate-dataset');
const pathToNeedlePath = require('../helper/path-to-needle-path');
const needlePathsToNeedlesParsed = require('../helper/needle-paths-to-needles-parsed');
const PRNG = require('../helper/prng');
const compiler = require('../../src/util/compiler');

describe('Testing parsed-needle-to-string-array.js', () => {
  it('Testing example', () => {
    const rng = PRNG('04eb4846-3b0c-4168-82fe-5a955f5161e3');
    expect(parsedNeedleToStringArray(generateParsedNeedle({ rng }))).to.deep.equal([
      '[4]',
      '{\\!,"[14][8][9]}'
    ]);
  });

  it('Testing empty array', () => {
    expect(parsedNeedleToStringArray([])).to.deep.equal([]);
  });

  it('Testing empty set', () => {
    expect(parsedNeedleToStringArray(new Set([]))).to.deep.equal([]);
  });

  it('Testing single element array', () => {
    expect(parsedNeedleToStringArray(['a'])).to.deep.equal(['a']);
  });

  it('Testing empty string selector', () => {
    expect(parsedNeedleToStringArray(new Set([[]]))).to.deep.equal(['']);
  });

  it('Testing single element set', () => {
    expect(parsedNeedleToStringArray(new Set(['a']))).to.deep.equal(['a']);
  });

  it('Testing set containing empty array', () => {
    expect(parsedNeedleToStringArray(new Set(['a', []]))).to.deep.equal(['a', '']);
  });

  it('Testing set containing array', () => {
    expect(parsedNeedleToStringArray(new Set(['a', ['1', '2']]))).to.deep.equal(['a', '1.2']);
  });

  it('Testing exclude pull up', () => {
    const r = new Set([['name', '[0]', 'value', new Set(['[!16]', '[!17]', '!str']), 'property']]);
    expect(parsedNeedleToStringArray(r)).to.deep.equal([
      'name[0].value.!{[16],[17],str}.property'
    ]);
  });

  it('Testing correctness of needle merging', () => {
    for (let idx = 0; idx < 50; idx += 1) {
      const { rng, paths } = generateDataset();
      const needlePaths = paths.map((p) => pathToNeedlePath(p, {
        lenPercentage: rng() > 0.1 ? rng() : 1,
        questionMark: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
        partialStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
        singleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
        doubleStar: rng() > 0.2 ? 0 : Math.floor(rng() * p.length) + 1,
        exclude: rng() > 0.9,
        shuffle: rng() > 0.9
      }));

      const needles1 = needlePaths.reduce((p, c) => {
        const parsed = needlePathsToNeedlesParsed([c]);
        p.push(parsedNeedleToStringArray(parsed)[0]);
        return p;
      }, []);
      const compiled1 = compiler.compile(needles1, false);

      const needlesParsed2 = needlePathsToNeedlesParsed(needlePaths);
      const needles2 = parsedNeedleToStringArray(needlesParsed2);
      const compiled2 = compiler.compile(needles2, false);

      expect(compiled1).to.deep.equal(compiled2);
    }
  });
});
