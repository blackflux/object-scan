import { describe } from 'node-tdd';
import { expect } from 'chai';
import traverser from '../../src/generic/traverser';
import generateSearchTree from '../helper/generate-search-tree';

describe('Testing traverser', () => {
  let recTraverse;
  before(() => {
    recTraverse = (obj, cb, depth = 0) => {
      cb('ENTER', obj, depth);
      Object.values(obj).reverse().forEach((e) => recTraverse(e, cb, depth + 1));
      cb('EXIT', obj, depth);
    };
  });

  it('Mass Testing Traverse Correctness', () => {
    for (let idx = 0; idx < 1000; idx += 1) {
      const data = generateSearchTree();
      const r1 = [];
      const r2 = [];
      recTraverse(data, (...args) => r1.push(args));
      traverser.traverse(data, (...args) => r2.push(args));
      expect(r1, JSON.stringify(data)).to.deep.equal(r2);
    }
  });
});
