import { describe } from 'node-tdd';
import { expect } from 'chai';
import jsonpath from 'jsonpath';
import jmespath from 'jmespath';
import objectScan from '../../src/index.js';
import cond from './fixtures/cond.js';

describe('Comparing value', () => {
  it('Testing objectScan', () => {
    const r = objectScan(['a[0].y'], {
      rtn: 'value',
      abort: true
    })(cond);
    expect(r).to.deep.equal(2);
  });

  it('Testing jsonpath', () => {
    const r = jsonpath.value(cond, '$.a[0].y');
    expect(r).to.deep.equal(2);
  });

  it('Testing jmespath', () => {
    const r = jmespath.search(cond, 'a[0].y');
    expect(r).to.deep.equal(2);
  });
});
