const expect = require('chai').expect;
const { describe } = require('node-tdd');
const iterator = require('../../src/util/iterator');

describe('Testing iterator', () => {
  let treeGen;
  let recIterate;
  let visualize;
  before(() => {
    treeGen = (() => {
      const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
      const MAX_DEPTH = 4;
      const MAX_WIDTH = 4;

      let index = 0;
      return (depth = 0) => {
        if (depth === 0) {
          index = 0;
        }
        if (!(index < CHARS.length) || Math.random() * MAX_DEPTH < depth) {
          index += 1;
          return CHARS[(index - 1) % CHARS.length];
        }
        const result = Math.random() > 0.5 ? new Set() : [];
        for (let idx = 0, len = Math.ceil(Math.random() * MAX_WIDTH); idx < len; idx += 1) {
          const entry = treeGen(depth + 1);
          result[Array.isArray(result) ? 'push' : 'add'](entry);
        }
        return result;
      };
    })();
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
    visualize = (obj) => {
      if (Array.isArray(obj)) {
        return `[${obj.map((e) => visualize(e)).join(',')}]`;
      }
      if (obj instanceof Set) {
        return `{${[...obj].map((e) => visualize(e)).join(',')}}`;
      }
      return obj;
    };
  });

  it('Mass Testing Iterate Correctness', () => {
    for (let idx = 0; idx < 1000; idx += 1) {
      const data = [treeGen()];
      const r1 = [];
      const r2 = [];
      recIterate(data, (...args) => r1.push(args));
      iterator.iterate(data, (type, arg) => r2.push([type, type === 'FIN' ? arg.slice(0) : arg]));
      expect(r1, visualize(data)).to.deep.equal(r2);
    }
  });

  it('Testing Empty Array handling', () => {
    const r1 = [];
    iterator.iterate(
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
