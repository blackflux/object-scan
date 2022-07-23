import fs from 'smart-fs';
import path from 'path';
import { describe } from 'node-tdd';
import { expect } from 'chai';
import genTable from '../benchmark/gen-table.js';

describe('Testing gen-table.js', () => {
  it('Testing basic', () => {
    const table = genTable();
    for (let i = 0; i < table.length; i += 1) {
      table[i] = table[i].replace(/!\[]\([^)]+\)/g, 'IMG');
    }
    const r = fs.smartWrite(
      path.join(fs.dirname(import.meta.url), 'gen-table.spec.js__fixtures', 'generated.md'),
      table
    );
    expect(r).to.equal(false);
  });
});
