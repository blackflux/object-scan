const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateParsedNeedle = require('../helper/generate-parsed-needle');
const parsedNeedleToStringArray = require('../helper/parsed-needle-to-string-array');

describe('Testing parsed-needle-to-string-array.js', { cryptoSeed: '04eb4846-3b0c-4168-82fe-5a955f5161e3' }, () => {
  it('Testing example', () => {
    expect(parsedNeedleToStringArray(generateParsedNeedle()))
      .to.deep.equal([
        '{\\!,",[9]}[11][6].#[3].{[12],[1]}[14][2].$',
        "{[13],{[8],%,{[4],&,'},(}}",
        ')'
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
});
