const expect = require('chai').expect;
const { describe } = require('node-tdd');
const pathToNeedle = require('../helper/path-to-needle');
const PRNG = require('../helper/prng');

describe('Testing path-to-needle.js', () => {
  let rng;
  let needle;
  let params;
  beforeEach(() => {
    rng = PRNG('44e669e4-401b-4440-9ee8-387ae0840d66');
    needle = ['name', 0, 'value', 16, 'property'];
    params = {
      exclude: false,
      lenPercentage: 1,
      questionMarkProbability: 0,
      partialStarProbability: 0,
      singleStar: false,
      doubleStar: false
    };
  });

  it('Testing no modification', () => {
    const r = pathToNeedle(needle, params);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: 'value', string: true, exclude: false },
      { value: '16', string: false, exclude: false },
      { value: 'property', string: true, exclude: false }
    ]);
  });

  it('Testing len percentage', () => {
    const r = pathToNeedle(needle, { ...params, lenPercentage: 0.5 }, rng);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: 'value', string: true, exclude: false }
    ]);
  });

  it('Testing exclude', () => {
    const r = pathToNeedle(needle, { ...params, exclude: true }, rng);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: 'value', string: true, exclude: true },
      { value: '16', string: false, exclude: false },
      { value: 'property', string: true, exclude: false }
    ]);
  });

  it('Testing question mark', () => {
    const r = pathToNeedle(needle, { ...params, questionMarkProbability: 1 }, rng);
    expect(r).to.deep.equal([
      { value: 'n?me', string: true, exclude: false },
      { value: '?', string: false, exclude: false },
      { value: '?alue', string: true, exclude: false },
      { value: '1?', string: false, exclude: false },
      { value: 'propert?', string: true, exclude: false }
    ]);
  });

  it('Testing partial star', () => {
    const r = pathToNeedle(needle, { ...params, partialStarProbability: 1 }, rng);
    expect(r).to.deep.equal([
      { value: 'n*me', string: true, exclude: false },
      { value: '*0', string: false, exclude: false },
      { value: 'va*e', string: true, exclude: false },
      { value: '1*6', string: false, exclude: false },
      { value: 'pr*perty', string: true, exclude: false }
    ]);
  });

  it('Testing single Star', () => {
    const r = pathToNeedle(needle, { ...params, singleStar: true }, rng);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: '*', string: true, exclude: false },
      { value: '16', string: false, exclude: false },
      { value: 'property', string: true, exclude: false }
    ]);
  });

  it('Testing double Star', () => {
    const r = pathToNeedle(needle, { ...params, doubleStar: true }, rng);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: '**', string: true, exclude: false },
      { value: 'property', string: true, exclude: false }
    ]);
  });

  it('Testing needle with special characters', () => {
    const r = pathToNeedle(['*force'], params, rng);
    expect(r).to.deep.equal([
      { value: '\\*force', string: true, exclude: false }
    ]);
  });
});
