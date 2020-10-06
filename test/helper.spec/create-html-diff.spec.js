const expect = require('chai').expect;
const { describe } = require('node-tdd');
const createHtmlDiff = require('../helper/create-html-diff');

describe('Testing create-html-diff.js', () => {
  it('Testing example', ({ fixture }) => {
    const r = createHtmlDiff('name', { a: 1 }, { a: 1, b: 2 });
    expect(r.split('\n')).to.deep.equal(fixture('example'));
  });
});
