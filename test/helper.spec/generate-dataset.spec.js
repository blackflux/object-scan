import fs from 'smart-fs';
import path from 'path';
import { describe } from 'node-tdd';
import { expect } from 'chai';
import generateDataset from '../helper/generate-dataset.js';

describe('Testing generate-dataset.js', () => {
  it('Testing seed consistency', () => {
    const seed = '2c67f2ed-d237-4831-85ba-4ee21ef9dad8';
    const {
      rng, haystack, paths
    } = generateDataset(seed);
    expect(rng.seed).to.deep.equal(seed);
    const filename = path.join(`${fs.filename(import.meta.url)}__resources`, 'seed-consistency.json');
    const result = fs.smartWrite(filename, { haystack, paths });
    expect(result).to.equal(false);
  });
});
