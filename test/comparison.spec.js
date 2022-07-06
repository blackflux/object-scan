import { describe } from 'node-tdd';
import { expect } from 'chai';
import jsonpath from 'jsonpath';
import jmespath from 'jmespath';
import objectScan from '../src/index.js';

describe('Comparing libraries', () => {
  let h1;
  let h2;
  beforeEach(() => {
    h1 = { F: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } } };
    h2 = { a: [{ x: 'yes', y: 2 }], b: [{ x: 'no', y: 1 }] };
  });

  it('Testing recursive search order objectScan', () => {
    const r1 = objectScan(['**'], {
      reverse: false,
      joined: true
    })(h1);
    expect(r1).to.deep.equal([
      'F.B.A',
      'F.B.D.C',
      'F.B.D.E',
      'F.B.D',
      'F.B',
      'F.G.I.H',
      'F.G.I',
      'F.G',
      'F'
    ]);
  });

  it('Testing recursive search order jsonpath', () => {
    const r2 = jsonpath.paths(h1, '$..[*]').map((e) => jsonpath.stringify(e).slice(2));
    expect(r2).to.deep.equal([
      'F',
      'F.B',
      'F.G',
      'F.B.A',
      'F.B.D',
      'F.B.D.C',
      'F.B.D.E',
      'F.G.I',
      'F.G.I.H'
    ]);
  });

  it('Testing value-filter objectScan', () => {
    const r1 = objectScan(['*[*]', '*[*].y'], {
      reverse: false,
      joined: true,
      breakFn: ({ matchedBy, value }) => (matchedBy.includes('*[*]') ? value?.x !== 'yes' : false),
      filterFn: ({ matchedBy }) => matchedBy.includes('*[*].y')
    })(h2);
    expect(r1).to.deep.equal(['a[0].y']);
  });

  it('Testing value-filter jsonpath', () => {
    const r2 = jsonpath.paths(h2, "$.*[?(@.x == 'yes')].y").map((e) => jsonpath.stringify(e).slice(2));
    expect(r2).to.deep.equal(['a[0].y']);
  });

  it('Testing value-filter jmespath', () => {
    const r2 = jmespath.search(h2, "*[?(x == 'yes')].y");
    expect(r2).to.deep.equal([[2], []]);
  });
});
