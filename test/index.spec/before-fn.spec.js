const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('../../src/index');

describe('Testing beforeFn', () => {
  it('Testing basic usage', () => {
    const r = objectScan(['**'], {
      rtn: 'key',
      beforeFn: (state) => {
        // eslint-disable-next-line no-param-reassign
        state.haystack = { ...state };
      }
    })({ haystack: true }, { context: true });
    expect(r).to.deep.equal([
      ['context', 'context'],
      ['context'],
      ['haystack', 'haystack'],
      ['haystack']
    ]);
  });

  it('Testing overwritten context returned', () => {
    const r = objectScan(['**'], {
      rtn: 'context',
      beforeFn: (state) => {
        expect(state.context).to.equal(undefined);
        // eslint-disable-next-line no-param-reassign
        state.context = { a: 1 };
      }
    })({ haystack: true });
    expect(r).to.deep.equal({ a: 1 });
  });
});
