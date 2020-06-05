const expect = require('chai').expect;
const { describe } = require('node-tdd');
const traverser = require('../../src/util/traverser');

describe('Testing traverser', () => {
  let haystackGen;
  let recTraverse;
  before(() => {
    haystackGen = (() => {
      const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
      const MAX_DEPTH = 7;
      const MAX_WIDTH = 7;

      let index = 0;
      return (depth = 0) => {
        if (depth === 0) {
          index = 0;
        }
        if (!(index < CHARS.length) || Math.random() * MAX_DEPTH < depth) {
          return {};
        }
        const result = {};
        for (let idx = 0, len = Math.ceil(Math.random() * MAX_WIDTH); idx < len; idx += 1) {
          result[CHARS[index % CHARS.length]] = haystackGen(depth + 1);
          index += 1;
        }
        return result;
      };
    })();
    recTraverse = (obj, cb, depth = 0) => {
      cb('ENTER', obj, depth);
      Object.values(obj).reverse().forEach((e) => recTraverse(e, cb, depth + 1));
      cb('EXIT', obj, depth);
    };
  });

  it('Mass Testing Traverse Correctness', () => {
    for (let idx = 0; idx < 1000; idx += 1) {
      const data = haystackGen();
      const r1 = [];
      const r2 = [];
      recTraverse(data, (...args) => r1.push(args));
      traverser.traverse(data, (...args) => r2.push(args));
      expect(r1, JSON.stringify(data)).to.deep.equal(r2);
    }
  });
});
