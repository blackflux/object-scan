import { describe } from 'node-tdd';
import { expect } from 'chai';
import objectScan from '../../src/index.js';
import generateDataset from '../helper/generate-dataset.js';

const exec = (needles, obj, opts = {}) => objectScan(needles, {
  orderByNeedles: true,
  joined: true,
  ...opts
})(obj);

describe('Testing orderByNeedles', () => {
  it('Testing basic usage (object)', () => {
    const r = exec(['c', 'a', 'b'], { a: 1, b: 2, c: 3 });
    expect(r).to.deep.equal(['c', 'a', 'b']);
  });

  it('Testing basic usage (reverse, object)', () => {
    const r = exec(['c', '*'], { a: 1, b: 2, c: 3 });
    expect(r).to.deep.equal(['c', 'b', 'a']);
  });

  it('Testing basic usage (not reverse, object)', () => {
    const r = exec(['c', '*'], { a: 1, b: 2, c: 3 }, { reverse: false });
    expect(r).to.deep.equal(['c', 'a', 'b']);
  });

  it('Testing basic usage (array)', () => {
    const r = exec(['[2]', '[*]'], [0, 1, 2, 3, 4]);
    expect(r).to.deep.equal(['[2]', '[4]', '[3]', '[1]', '[0]']);
  });

  it('Testing basic usage (not reverse, array)', () => {
    const r = exec(['[2]', '[*]'], [0, 1, 2, 3, 4], { reverse: false });
    expect(r).to.deep.equal(['[2]', '[0]', '[1]', '[3]', '[4]']);
  });

  it('Testing nested matched where expected', () => {
    const r = exec(['a', 'b', 'c.d', 'f', 'e'], {
      a: 0,
      b: 1,
      c: { d: 2 },
      e: 4,
      f: 5
    });
    expect(r).to.deep.equal([
      'a', 'b', 'c.d', 'f', 'e'
    ]);
  });

  it('Testing multiple matches', () => {
    const r = exec(['**', '*', 'a', 'b'], { a: 0, b: 1 });
    expect(r).to.deep.equal(['a', 'b']);
  });

  it('Testing all matched by star', () => {
    const r = exec(['*', 'a'], { a: 0, b: 1 });
    expect(r).to.deep.equal(['b', 'a']);
  });

  it('Testing all matched by starstar', () => {
    const r = exec(['**', 'a'], { a: 0, b: 1 });
    expect(r).to.deep.equal(['b', 'a']);
  });

  it('Testing all matched by starstar and star', () => {
    const r = exec(['**', '*', 'a'], { a: 0, b: 1 });
    expect(r).to.deep.equal(['b', 'a']);
  });

  it('Testing multiple nesting', () => {
    const r = exec(['l', 'o'], [{
      l: [{ id: 0 }, { id: 1 }],
      o: [{ id: 0 }, { id: 1 }]
    }], {
      useArraySelector: false
    });
    expect(r).to.deep.equal([
      '[0].l[1]', '[0].l[0]',
      '[0].o[1]', '[0].o[0]'
    ]);
  });

  it('Testing matching empty needle last', () => {
    const r = exec(['b', '', 'a'], { a: 0, b: 1 });
    expect(r).to.deep.equal(['b', 'a', '']);
  });

  it('Testing edge case ordering', () => {
    const r = exec(['b.c', 'a', 'b', 'd'], { a: 0, b: { c: 1 }, d: 2 });
    expect(r).to.deep.equal([
      'b.c', 'b', 'a', 'd'
    ]);
  });

  it('Testing starstar order consistent', () => {
    for (let idx = 0; idx < 20; idx += 1) {
      const { haystack } = generateDataset();
      const r1 = objectScan(['**'])(haystack);
      const r2 = objectScan(['**'], { orderByNeedles: true })(haystack);
      expect(r1).to.deep.equal(r2);
    }
  });
});
