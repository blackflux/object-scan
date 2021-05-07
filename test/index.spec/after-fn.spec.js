const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('../../src/index');

describe('Testing afterFn', () => {
  it('Testing basic usage', () => {
    const r = objectScan(['**'], {
      rtn: 'key',
      afterFn: (result, context) => [result, context]
    })({ k1: true, k2: true }, { context: true });
    expect(r).to.deep.equal([
      [['k2'], ['k1']],
      { context: true }
    ]);
  });

  it('Testing basic usage with abort=true', () => {
    const r = objectScan(['**'], {
      abort: true,
      rtn: 'key',
      afterFn: (result, context) => [result, context]
    })({ k1: true, k2: true }, { context: true });
    expect(r).to.deep.equal([
      ['k2'],
      { context: true }
    ]);
  });
});
