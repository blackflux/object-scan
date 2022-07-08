import { describe } from 'node-tdd';
import { expect } from 'chai';
import jsonpath from 'jsonpath';
import jmespath from 'jmespath';
import objectScan from '../../src/index.js';
import cond from './fixtures/cond.js';

describe('Comparing condition', () => {
  it('Testing objectScan', () => {
    const r = objectScan(['*[*].y'], {
      breakFn: ({ depth, value }) => depth === 2 && value?.x !== 'yes',
      joined: true
    })(cond);
    expect(r).to.deep.equal(['a[0].y']);
  });

  it('Testing jsonpath', () => {
    const r = jsonpath.paths(cond, "$.*[?(@.x == 'yes')].y").map((e) => jsonpath.stringify(e).slice(2));
    expect(r).to.deep.equal(['a[0].y']);
  });

  it('Testing jmespath', () => {
    const r = jmespath.search(cond, "*[?(x == 'yes')].y");
    expect(r).to.deep.equal([[2], []]);
  });
});
