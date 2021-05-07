const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('../../src/index');

describe('Testing beforeFn', () => {
  it('Testing basic usage', () => {
    const r = objectScan(['**'], {
      rtn: 'key',
      beforeFn: (haystack, context) => [haystack, context]
    })({ haystack: true }, { context: true });
    expect(r).to.deep.equal([
      [1, 'context'],
      [1],
      [0, 'haystack'],
      [0]
    ]);
  });
});
