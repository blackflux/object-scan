import { describe } from 'node-tdd';
import { expect } from 'chai';
import objectScan from '../../src/index.js';

describe('Testing array needles', () => {
  it('Testing string needle', () => {
    const needles = [['a', 'b', 'c']];
    const haystack = { a: { b: { c: 0 } } };
    const r = objectScan(needles)(haystack);
    expect(r).to.deep.equal(needles);
  });

  it('Testing number needle', () => {
    const needles = [[0, 1, 2]];
    const haystack = [[0, [1, 2, 3]]];
    const r = objectScan(needles)(haystack);
    expect(r).to.deep.equal(needles);
  });

  it('Testing mixed needle', () => {
    const needles = [['a', 0, 'b']];
    const haystack = { a: [{ b: 0 }] };
    const r = objectScan(needles)(haystack);
    expect(r).to.deep.equal(needles);
  });

  it('Testing advanced query', () => {
    const needles = [
      ['c', 'f', 'g', 0],
      ['a', 'd', 2]
    ];
    const haystack = {
      a: {
        d: [0, 1, 2]
      },
      b: {
        e: [1, 2, 3]
      },
      c: {
        f: {
          g: [1, 2, 3]
        }
      }
    };
    const r = objectScan(needles)(haystack);
    expect(r).to.deep.equal(needles);
  });

  it('Testing escaping', () => {
    const needles = [['a.b', 0]];
    const haystack = {
      'a.b': [0],
      a: { b: [1] }
    };
    const r = objectScan(needles, { rtn: 'value' })(haystack);
    expect(r).to.deep.equal([0]);
  });

  it('Testing backslash', () => {
    const needles = [['a\\b', 0]];
    const haystack = {
      'a\\b': [0]
    };
    const r = objectScan(needles, { rtn: 'value' })(haystack);
    expect(r).to.deep.equal([0]);
  });

  it('Testing matchedBy', () => {
    const needles = [['a', 0, 'b'], ['a', 1, 'b'], 'a[*].b'];
    const haystack = { a: [{ b: 0 }, { b: 0 }] };
    const r = objectScan(needles, { rtn: 'matchedBy' })(haystack);
    expect(r).to.deep.equal([
      [['a', 1, 'b'], 'a[*].b'],
      [['a', 0, 'b'], 'a[*].b']
    ]);
    expect(needles[0]).to.equal(r[1][0]);
    expect(needles[1]).to.equal(r[0][0]);
  });

  it('Testing orderByNeedles=true', () => {
    const needles = [['a', 0, 'b'], ['a', 1, 'b'], 'a[*].b'];
    const haystack = { a: [{ b: 0 }, { b: 0 }] };
    const r = objectScan(needles, { orderByNeedles: true })(haystack);
    expect(r).to.deep.equal([['a', 0, 'b'], ['a', 1, 'b']]);
  });

  it('Testing useArraySelector=false', () => {
    const needles = [['a', 'b']];
    const haystack = { a: [{ b: 0 }, { b: 0 }] };
    const r = objectScan(needles, { useArraySelector: false })(haystack);
    expect(r).to.deep.equal([['a', 1, 'b'], ['a', 0, 'b']]);
  });

  it('Testing empty array', () => {
    const needles = [[]];
    const haystack = [{ a: 0 }, { b: 1 }];
    expect(objectScan(needles, { useArraySelector: false })(haystack))
      .to.deep.equal([[1], [0]]);
  });

  it('Testing redundant needle', () => {
    expect(() => objectScan([['a', 0, 'b'], ['a', 0, 'b']]))
      .to.throw('Redundant Needle Target: "a[0].b" vs "a[0].b"');
    expect(() => objectScan([['a', 0, 'b'], 'a[0].b']))
      .to.throw('Redundant Needle Target: "a[0].b" vs "a[0].b"');
    expect(() => objectScan(['a[0].b', ['a', 0, 'b']]))
      .to.throw('Redundant Needle Target: "a[0].b" vs "a[0].b"');
    expect(() => objectScan(['', []]))
      .to.throw('Redundant Needle Target: "" vs ""');
  });

  it('Testing useArraySelector=false with number', () => {
    expect(() => objectScan([['a', 0, 'b']], { useArraySelector: false }))
      .to.throw('Forbidden Array Selector: ["a",0,"b"], idx 1');
  });
});
