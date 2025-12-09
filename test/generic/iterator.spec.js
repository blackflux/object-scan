import crypto from 'crypto';
import { describe } from 'node-tdd';
import { expect } from 'chai';
import iterator from '../../src/generic/iterator.js';
import parsedNeedleToStringArray from '../helper/parsed-needle-to-string-array.js';
import generateParsedNeedle from '../helper/generate-parsed-needle.js';
import PRNG from '../helper/prng.js';

describe('Testing iterator', () => {
  let recIterate;

  before(() => {
    recIterate = (obj, cb) => {
      if (Array.isArray(obj[0])) {
        recIterate([...obj[0], ...obj.slice(1)], cb);
        return;
      }
      cb('ADD', obj[0]);
      if (obj.length === 1) {
        cb('FIN', obj[0]);
      } else {
        recIterate(obj.slice(1), cb);
      }
      cb('RM', obj[0]);
    };
  });

  it('Mass Testing Iterate Correctness', () => {
    for (let idx = 0; idx < 1000; idx += 1) {
      const seed = crypto.randomUUID();
      const rng = PRNG(seed);
      const data = [generateParsedNeedle({ rng })];
      const r1 = [];
      const r2 = [];
      recIterate(data, (...args) => r1.push(args));
      iterator(data, (type, arg) => r2.push([type, arg]));
      expect(r1, parsedNeedleToStringArray(data)).to.deep.equal(r2);
    }
  });

  it('Testing Empty Array handling', () => {
    const r1 = [];
    const mkOr = (v) => {
      // eslint-disable-next-line no-param-reassign
      v.or = true;
      return v;
    };
    iterator(
      [1, mkOr([2, []]), 3],
      (type, arg) => r1.push([type, arg])
    );
    expect(r1).to.deep.equal([
      ['ADD', 1],
      ['ADD', 2],
      ['ADD', 3],
      ['FIN', 3],
      ['RM', 3],
      ['RM', 2],
      ['ADD', 3],
      ['FIN', 3],
      ['RM', 3],
      ['RM', 1]
    ]);
  });
});
