import path from 'path';
import fs from 'smart-fs';
import { describe } from 'node-tdd';
import { expect } from 'chai';
import genTable from '../benchmark/gen-table.js';

const normalize = (table) => {
  const result = [];
  for (let i = 0; i < table.length; i += 1) {
    result.push(table[i].replace(/!\[]\([^)]+\)/g, 'IMG'));
  }
  return result;
};

describe('Testing gen-table.js', { timeout: 60000 }, () => {
  it('Testing basic', async () => {
    const generated = normalize(await genTable());
    const expectedFilePath = path.join(fs.dirname(import.meta.url), '..', 'benchmark', 'result.md');
    const expected = normalize(fs.smartRead(expectedFilePath));
    expect(generated).to.deep.equal(expected);
  });
});
