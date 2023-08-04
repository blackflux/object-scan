import path from 'path';
import fs from 'smart-fs';
import { describe } from 'node-tdd';
import { expect } from 'chai';
import createHtmlDiff from '../helper/create-html-diff.js';

describe('Testing create-html-diff.js', () => {
  it('Testing example', () => {
    const r = createHtmlDiff('name', { a: 1 }, { a: 1, b: 2 });
    expect(fs.smartWrite(
      path.join(`${fs.filename(import.meta.url)}__fixtures`, 'example.html'),
      r.split('\n')
    )).to.equal(false);
  });

  it('Testing example with meta', () => {
    const r = createHtmlDiff('name', { a: 1 }, { a: 1, b: 2 }, {
      bool: true,
      data: { value: 1 }
    });
    expect(fs.smartWrite(
      path.join(`${fs.filename(import.meta.url)}__fixtures`, 'example-with-meta.html'),
      r.split('\n')
    )).to.equal(false);
  });
});
