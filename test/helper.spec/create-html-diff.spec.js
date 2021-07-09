const expect = require('chai').expect;
const fs = require('smart-fs');
const path = require('path');
const { describe } = require('node-tdd');
const createHtmlDiff = require('../helper/create-html-diff');

describe('Testing create-html-diff.js', () => {
  it('Testing example', ({ fixture }) => {
    const r = createHtmlDiff('name', { a: 1 }, { a: 1, b: 2 });
    expect(fs.smartWrite(
      path.join(`${__filename}__fixtures`, 'example.html'),
      r.split('\n')
    )).to.equal(false);
  });

  it('Testing example with meta', ({ fixture }) => {
    const r = createHtmlDiff('name', { a: 1 }, { a: 1, b: 2 }, {
      bool: true,
      data: { value: 1 }
    });
    expect(fs.smartWrite(
      path.join(`${__filename}__fixtures`, 'example-with-meta.html'),
      r.split('\n')
    )).to.equal(false);
  });
});
