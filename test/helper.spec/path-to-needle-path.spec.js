import { describe } from 'node-tdd';
import { expect } from 'chai';
import pathToNeedlePath from '../helper/path-to-needle-path.js';
import PRNG from '../helper/prng.js';

describe('Testing path-to-needle-path.js', () => {
  let rng;
  let needle;

  beforeEach(() => {
    rng = PRNG('44e669e4-401b-4440-9ee8-387ae0840d66');
    needle = ['name', 0, 'value', 16, 'property'];
  });

  it('Testing no modification', () => {
    const r = pathToNeedlePath(needle);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: 'value', string: true, exclude: false },
      { value: '16', string: false, exclude: false },
      { value: 'property', string: true, exclude: false }
    ]);
  });

  it('Testing len percentage', () => {
    const r = pathToNeedlePath(needle, { lenPercentage: 0.5 }, rng);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: 'value', string: true, exclude: false }
    ]);
  });

  it('Testing exclude', () => {
    const r = pathToNeedlePath(needle, { exclude: true }, rng);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: 'value', string: true, exclude: false },
      { value: '16', string: false, exclude: false },
      { value: 'property', string: true, exclude: true }
    ]);
  });

  it('Testing shuffle', () => {
    const r = pathToNeedlePath(needle, { shuffle: true }, rng);
    expect(r).to.deep.equal([
      { value: 'value', string: true, exclude: false },
      { value: 'name', string: true, exclude: false },
      { value: '16', string: false, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: 'property', string: true, exclude: false }
    ]);
  });

  it('Testing exclude empty needle', () => {
    const r = pathToNeedlePath(needle, { exclude: true, lenPercentage: 0 }, rng);
    expect(r).to.deep.equal([]);
  });

  describe('Testing question mark', () => {
    it('Testing default', () => {
      const r = pathToNeedlePath(needle, { questionMark: 5 }, rng);
      expect(r).to.deep.equal([
        { value: 'name', string: true, exclude: false },
        { value: '?', string: false, exclude: false },
        { value: '?a??e', string: true, exclude: false },
        { value: '16', string: false, exclude: false },
        { value: 'prop?rty', string: true, exclude: false }
      ]);
    });

    it('Testing multiple', () => {
      const r = pathToNeedlePath(['1234567890'], { questionMark: 5 }, rng);
      expect(r).to.deep.equal([
        { value: '??3?5??890', string: true, exclude: false }
      ]);
    });
  });

  describe('Testing partial plus', () => {
    it('Testing default', () => {
      const r = pathToNeedlePath(needle, { partialPlus: 5 }, rng);
      expect(r).to.deep.equal([
        { value: 'name', string: true, exclude: false },
        { value: '+', string: false, exclude: false },
        { value: '+++e', string: true, exclude: false },
        { value: '16', string: false, exclude: false },
        { value: 'prop+y', string: true, exclude: false }
      ]);
    });

    it('Testing multiple', () => {
      const r = pathToNeedlePath(['1234567890'], { partialPlus: 3 }, rng);
      expect(r).to.deep.equal([
        { value: '1234+++0', string: true, exclude: false }
      ]);
    });

    it('Testing replace', () => {
      const r = pathToNeedlePath(['0'], { partialPlus: 1 }, PRNG('4fe2ba45-0932-4ccd-a5ba-374ef4f0aa4c'));
      expect(r).to.deep.equal([
        { value: '+', string: true, exclude: false }
      ]);
    });
  });

  describe('Testing partial star', () => {
    it('Testing default', () => {
      const r = pathToNeedlePath(needle, { partialStar: 5 }, rng);
      expect(r).to.deep.equal([
        { value: 'name', string: true, exclude: false },
        { value: '0*', string: false, exclude: false },
        { value: '*v*l*e', string: true, exclude: false },
        { value: '16', string: false, exclude: false },
        { value: 'prope*y', string: true, exclude: false }
      ]);
    });

    it('Testing multiple', () => {
      const r = pathToNeedlePath(['1234567890'], { partialStar: 3 }, rng);
      expect(r).to.deep.equal([
        { value: '12345*6*7*0', string: true, exclude: false }
      ]);
    });

    it('Testing before', () => {
      const r = pathToNeedlePath(['0'], { partialStar: 1 }, PRNG('13b57a37-99a5-483f-a21c-48877ace091a'));
      expect(r).to.deep.equal([
        { value: '*0', string: true, exclude: false }
      ]);
    });

    it('Testing after', () => {
      const r = pathToNeedlePath(['0'], { partialStar: 1 }, PRNG('e837b890-f558-43a4-bd2c-b50c1116442c'));
      expect(r).to.deep.equal([
        { value: '0*', string: true, exclude: false }
      ]);
    });

    it('Testing replace', () => {
      const r = pathToNeedlePath(['0'], { partialStar: 1 }, PRNG('4fe2ba45-0932-4ccd-a5ba-374ef4f0aa4c'));
      expect(r).to.deep.equal([
        { value: '*', string: true, exclude: false }
      ]);
    });
  });

  it('Testing single Star', () => {
    const r = pathToNeedlePath(needle, { singleStar: 2 }, rng);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '*', string: false, exclude: false },
      { value: 'value', string: true, exclude: false },
      { value: '16', string: false, exclude: false },
      { value: '*', string: true, exclude: false }
    ]);
  });

  describe('Testing double Plus', () => {
    it('Testing default', () => {
      const r = pathToNeedlePath(needle, { doublePlus: 2 }, rng);
      expect(r).to.deep.equal([
        { value: 'name', string: true, exclude: false },
        { value: '++', string: true, exclude: false },
        { value: 'value', string: true, exclude: false },
        { value: '16', string: false, exclude: false },
        { value: '++', string: true, exclude: false }
      ]);
    });

    it('Testing replace', () => {
      const r = pathToNeedlePath([0], { doublePlus: 1 }, PRNG('fc863e2a-f73e-4e49-b349-70b9ddb82f47'));
      expect(r).to.deep.equal([
        { value: '++', string: true, exclude: false }
      ]);
    });
  });

  describe('Testing double Star', () => {
    it('Testing default', () => {
      const r = pathToNeedlePath(needle, { doubleStar: 2 }, rng);
      expect(r).to.deep.equal([
        { value: 'name', string: true, exclude: false },
        { value: '**', string: true, exclude: false },
        { value: 'value', string: true, exclude: false },
        { value: '16', string: false, exclude: false },
        { value: 'property', string: true, exclude: false },
        { value: '**', string: true, exclude: false }
      ]);
    });

    it('Testing replace', () => {
      const r = pathToNeedlePath([0], { doubleStar: 1 }, PRNG('fc863e2a-f73e-4e49-b349-70b9ddb82f47'));
      expect(r).to.deep.equal([
        { value: '**', string: true, exclude: false }
      ]);
    });

    it('Testing prepend', () => {
      const r = pathToNeedlePath([0], { doubleStar: 1 }, PRNG('46909d48-312d-4045-9230-3e60ef908620'));
      expect(r).to.deep.equal([
        { value: '**', string: true, exclude: false },
        { value: '0', string: false, exclude: false }
      ]);
    });

    it('Testing append', () => {
      const r = pathToNeedlePath([0], { doubleStar: 1 }, PRNG('25ccb861-5a2d-497b-98e3-9b581691f981'));
      expect(r).to.deep.equal([
        { value: '0', string: false, exclude: false },
        { value: '**', string: true, exclude: false }
      ]);
    });
  });

  describe('Testing regex', () => {
    it('Testing regex default', () => {
      const r = pathToNeedlePath(needle, { regex: 5 }, rng);
      expect(r).to.deep.equal([
        { value: '(^name$)', string: true, exclude: false },
        { value: '(0)', string: false, exclude: false },
        { value: '(value$)', string: true, exclude: false },
        { value: '(^16$)', string: false, exclude: false },
        { value: '(^property$)', string: true, exclude: false }
      ]);
    });

    it('Testing regex double plus', () => {
      const r = pathToNeedlePath(['abc'], { doublePlus: 1, regex: 1 }, rng);
      expect(r).to.deep.equal([
        { value: '++(.*)', string: true, exclude: false }
      ]);
    });

    it('Testing regex double star', () => {
      const r = pathToNeedlePath(['abc'], { doubleStar: 1, regex: 2 }, rng);
      expect(r).to.deep.equal([
        { value: '(^abc$)', string: true, exclude: false },
        { value: '**(.*)', string: true, exclude: false }
      ]);
    });

    it('Testing regex single star', () => {
      const r = pathToNeedlePath(['abc'], { singleStar: 1, regex: 1 }, rng);
      expect(r).to.deep.equal([
        { value: '(.*)', string: true, exclude: false }
      ]);
    });

    it('Testing regex partial star', () => {
      const r = pathToNeedlePath(['abc'], { partialStar: 1, regex: 1 }, rng);
      expect(r).to.deep.equal([
        { value: '(^a.*c$)', string: true, exclude: false }
      ]);
    });

    it('Testing regex partial plus', () => {
      const r = pathToNeedlePath(['abc'], { partialPlus: 1, regex: 1 }, rng);
      expect(r).to.deep.equal([
        { value: '(^a.+c$)', string: true, exclude: false }
      ]);
    });

    it('Testing regex question mark', () => {
      const r = pathToNeedlePath(['abc'], { questionMark: 1, regex: 1 }, rng);
      expect(r).to.deep.equal([
        { value: '(a.c$)', string: true, exclude: false }
      ]);
    });

    it('Testing regex escaped char', () => {
      const r = pathToNeedlePath(['a(b'], { regex: 1 }, rng);
      expect(r).to.deep.equal([
        { value: '(a\\(b)', string: true, exclude: false }
      ]);
    });
  });

  it('Testing needle with special characters', () => {
    const r = pathToNeedlePath(['*force'], {}, rng);
    expect(r).to.deep.equal([
      { value: '\\*force', string: true, exclude: false }
    ]);
  });

  it('Testing empty needle', () => {
    const r = pathToNeedlePath([]);
    expect(r).to.deep.equal([]);
  });
});
