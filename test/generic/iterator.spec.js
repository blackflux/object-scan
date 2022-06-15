import { describe } from 'node-tdd';
import { expect } from 'chai';
import { v4 as uuid } from 'uuid';
import iterator from '../../src/generic/iterator.js';
import parsedNeedleToStringArray from '../helper/parsed-needle-to-string-array.js';
import generateParsedNeedle from '../helper/generate-parsed-needle.js';
import PRNG from '../helper/prng.js';

describe('Testing iterator', () => {
  let recIterate;
  before(() => {
    recIterate = (obj, cb, path = []) => {
      if (obj.length === 0) {
        cb('FIN', path);
        return;
      }
      if (Array.isArray(obj[0])) {
        recIterate([...obj[0], ...obj.slice(1)], cb, path);
        return;
      }
      if (obj[0] instanceof Set) {
        obj[0].forEach((e) => {
          recIterate([e, ...obj.slice(1)], cb, path);
        });
        return;
      }
      cb('ADD', obj[0]);
      recIterate(obj.slice(1), cb, path.concat(obj[0]));
      cb('RM', obj[0]);
    };
  });

  it('Mass Testing Iterate Correctness', () => {
    for (let idx = 0; idx < 1000; idx += 1) {
      const seed = uuid();
      const rng = PRNG(seed);
      const data = [generateParsedNeedle({ rng })];
      const r1 = [];
      const r2 = [];
      recIterate(data, (...args) => r1.push(args));
      iterator(data, (type, arg) => r2.push([type, type === 'FIN' ? arg.slice(0) : arg]));
      expect(r1, parsedNeedleToStringArray(data)).to.deep.equal(r2);
    }
  });

  it('Testing Empty Array handling', () => {
    const r1 = [];
    iterator(
      [1, new Set([2, []]), 3],
      (type, arg) => r1.push([type, type === 'FIN' ? arg.slice(0) : arg])
    );
    expect(r1).to.deep.equal([
      ['ADD', 1],
      ['ADD', 2],
      ['ADD', 3],
      ['FIN', [1, 2, 3]],
      ['RM', 3],
      ['RM', 2],
      ['ADD', 3],
      ['FIN', [1, 3]],
      ['RM', 3],
      ['RM', 1]
    ]);
  });
});
