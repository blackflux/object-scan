import fs from 'smart-fs';
import path from 'path';
import { describe } from 'node-tdd';
import { expect } from 'chai';
import PRNG from '../helper/prng';
import generateHaystack from '../helper/generate-haystack';
import haystackGenerator from '../helper/haystack-generator';

describe('Testing generate-haystack.js', () => {
  it('Testing example', () => {
    const rng = PRNG('3b8c58e7-436d-4229-8ad5-eca7670fb803');
    const generator = haystackGenerator({ rng });
    const haystack = generateHaystack(generator);

    const filename = path.join(`${__filename}__resources`, 'example-haystack.json');
    const result = fs.smartWrite(filename, haystack);
    expect(result).to.equal(false);
  });
});
