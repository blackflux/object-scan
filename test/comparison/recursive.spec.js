import { describe } from 'node-tdd';
import { expect } from 'chai';
import jsonpath from 'jsonpath';
import objectScan from '../../src/index.js';
import tree from './fixtures/tree.js';

describe('Comparing recursive', () => {
  it('Testing objectScan', () => {
    const r = objectScan(['**'], {
      reverse: false,
      joined: true
    })(tree);
    expect(r).to.deep.equal([
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

  it('Testing jsonpath', () => {
    const r = jsonpath.paths(tree, '$..[*]').map((e) => jsonpath.stringify(e).slice(2));
    expect(r).to.deep.equal([
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
});
