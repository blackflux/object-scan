import { describe } from 'node-tdd';
import { expect } from 'chai';
import jsonpath from 'jsonpath';
import jmespath from 'jmespath';
import objectScan from '../../src/index.js';
import cond from './fixtures/cond.js';

describe('Comparing condition', () => {
  it('Testing objectScan', ({ fixture }) => {
    const r1 = objectScan(['*[*]', '*[*].y'], {
      reverse: false,
      joined: true,
      breakFn: ({ matchedBy, value }) => (matchedBy.includes('*[*]') ? value?.x !== 'yes' : false),
      filterFn: ({ matchedBy }) => matchedBy.includes('*[*].y')
    })(cond);
    expect(r1).to.deep.equal(['a[0].y']);
  });

  it('Testing jsonpath', ({ fixture }) => {
    const r2 = jsonpath.paths(cond, "$.*[?(@.x == 'yes')].y").map((e) => jsonpath.stringify(e).slice(2));
    expect(r2).to.deep.equal(['a[0].y']);
  });

  it('Testing jmespath', ({ fixture }) => {
    const r2 = jmespath.search(cond, "*[?(x == 'yes')].y");
    expect(r2).to.deep.equal([[2], []]);
  });
});
