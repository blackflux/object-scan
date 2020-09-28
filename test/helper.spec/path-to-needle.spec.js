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
      questionMark: 0,
      partialStar: 0,
      singleStar: 0,
      doubleStar: 0
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
      { value: 'value', string: true, exclude: false },
      { value: '16', string: false, exclude: false },
      { value: 'property', string: true, exclude: true }
    ]);
  });

  describe('Testing question mark', () => {
    it('Testing default', () => {
      const r = pathToNeedle(needle, { ...params, questionMark: 5 }, rng);
      expect(r).to.deep.equal([
        { value: 'na?e', string: true, exclude: false },
        { value: '?', string: false, exclude: false },
        { value: '?alue', string: true, exclude: false },
        { value: '?6', string: false, exclude: false },
        { value: '?roperty', string: true, exclude: false }
      ]);
    });

    it('Testing multiple', () => {
      const r = pathToNeedle(['1234567890'], { ...params, questionMark: 5 }, rng);
      expect(r).to.deep.equal([
        { value: '??3?5??890', string: true, exclude: false }
      ]);
    });
  });

  describe('Testing partial star', () => {
    it('Testing default', () => {
      const r = pathToNeedle(needle, { ...params, partialStar: 5 }, rng);
      expect(r).to.deep.equal([
        { value: 'nam*', string: true, exclude: false },
        { value: '*', string: false, exclude: false },
        { value: '*ue', string: true, exclude: false },
        { value: '16*', string: false, exclude: false },
        { value: 'property*', string: true, exclude: false }
      ]);
    });

    it('Testing multiple', () => {
      const r = pathToNeedle(['1234567890'], { ...params, partialStar: 5 }, rng);
      expect(r).to.deep.equal([
        { value: '**78*9**0', string: true, exclude: false }
      ]);
    });

    it('Testing before', () => {
      const r = pathToNeedle(['0'], { ...params, partialStar: 1 }, PRNG('13b57a37-99a5-483f-a21c-48877ace091a'));
      expect(r).to.deep.equal([
        { value: '*0', string: true, exclude: false }
      ]);
    });

    it('Testing after', () => {
      const r = pathToNeedle(['0'], { ...params, partialStar: 1 }, PRNG('e837b890-f558-43a4-bd2c-b50c1116442c'));
      expect(r).to.deep.equal([
        { value: '0*', string: true, exclude: false }
      ]);
    });

    it('Testing replace', () => {
      const r = pathToNeedle(['0'], { ...params, partialStar: 1 }, PRNG('4fe2ba45-0932-4ccd-a5ba-374ef4f0aa4c'));
      expect(r).to.deep.equal([
        { value: '*', string: true, exclude: false }
      ]);
    });
  });

  it('Testing single Star', () => {
    const r = pathToNeedle(needle, { ...params, singleStar: 2 }, rng);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '*', string: false, exclude: false },
      { value: 'value', string: true, exclude: false },
      { value: '16', string: false, exclude: false },
      { value: '*', string: true, exclude: false }
    ]);
  });

  describe('Testing double Star', () => {
    it('Testing default', () => {
      const r = pathToNeedle(needle, { ...params, doubleStar: 2 }, rng);
      expect(r).to.deep.equal([
        { value: 'name', string: true, exclude: false },
        { value: '**', string: true, exclude: false },
        { value: '16', string: false, exclude: false },
        { value: 'property', string: true, exclude: false },
        { value: '**', string: true, exclude: false }
      ]);
    });

    it('Testing replace', () => {
      const r = pathToNeedle([0], { ...params, doubleStar: 1 }, PRNG('fc863e2a-f73e-4e49-b349-70b9ddb82f47'));
      expect(r).to.deep.equal([
        { value: '**', string: true, exclude: false }
      ]);
    });

    it('Testing prepend', () => {
      const r = pathToNeedle([0], { ...params, doubleStar: 1 }, PRNG('46909d48-312d-4045-9230-3e60ef908620'));
      expect(r).to.deep.equal([
        { value: '**', string: true, exclude: false },
        { value: '0', string: false, exclude: false }
      ]);
    });

    it('Testing append', () => {
      const r = pathToNeedle([0], { ...params, doubleStar: 1 }, PRNG('25ccb861-5a2d-497b-98e3-9b581691f981'));
      expect(r).to.deep.equal([
        { value: '0', string: false, exclude: false },
        { value: '**', string: true, exclude: false }
      ]);
    });
  });

  it('Testing needle with special characters', () => {
    const r = pathToNeedle(['*force'], params, rng);
    expect(r).to.deep.equal([
      { value: '\\*force', string: true, exclude: false }
    ]);
  });
});
