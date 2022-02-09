import fs from 'smart-fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe } from 'node-tdd';
import { expect } from 'chai';
import PRNG from '../helper/prng.js';
import generateHaystack from '../helper/generate-haystack.js';
import haystackGenerator from '../helper/haystack-generator.js';

describe('Testing generate-haystack.js', () => {
  it('Testing example', () => {
    const rng = PRNG('3b8c58e7-436d-4229-8ad5-eca7670fb803');
    const generator = haystackGenerator({ rng });
    const haystack = generateHaystack(generator);

    const filename = path.join(`${fileURLToPath(import.meta.url)}__resources`, 'example-haystack.json');
    const result = fs.smartWrite(filename, haystack);
    expect(result).to.equal(false);
  });
});
