import { describe } from 'node-tdd';
import { expect } from 'chai';
import objectScan from '../../src/index';

describe('Testing afterFn', () => {
  it('Testing basic usage', () => {
    const r = objectScan(['**'], {
      rtn: 'key',
      afterFn: (state) => {
        // eslint-disable-next-line no-param-reassign
        state.result = { ...state };
      }
    })({ k1: true, k2: true }, { context: true });
    expect(r).to.deep.equal({
      haystack: { k1: true, k2: true },
      context: { context: true },
      result: [['k2'], ['k1']]
    });
  });

  it('Testing basic usage with abort=true', () => {
    const r = objectScan(['**'], {
      abort: true,
      rtn: 'key',
      afterFn: (state) => {
        // eslint-disable-next-line no-param-reassign
        state.result = { ...state };
      }
    })({ k1: true, k2: true }, { context: true });
    expect(r).to.deep.equal({
      haystack: { k1: true, k2: true },
      context: { context: true },
      result: ['k2']
    });
  });
});
