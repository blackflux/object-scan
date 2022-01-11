import { describe } from 'node-tdd';
import { expect } from 'chai';
import generateParsedNeedle from '../helper/generate-parsed-needle';
import parsedNeedleToStringArray from '../helper/parsed-needle-to-string-array';
import PRNG from '../helper/prng';

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
});
