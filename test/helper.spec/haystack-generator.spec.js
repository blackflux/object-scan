import fs from 'smart-fs';
import path from 'path';
import { describe } from 'node-tdd';
import { expect } from 'chai';
import PRNG from '../helper/prng';
import generateHaystack from '../helper/generate-haystack';
import haystackGenerator from '../helper/haystack-generator';
import analyzeHaystack from '../helper/analyze-haystack';

describe('Testing haystack-generator.js', { timeout: 5000 }, () => {
  it('Testing distribution', () => {
    const data = {
      depth: {},
      leaves: {},
      branchingFactors: {},
      types: {}
    };
    for (let idx = 0; idx < 1000; idx += 1) {
      const rng = PRNG(`${idx}`);
      const generator = haystackGenerator({ rng });
      const haystack = generateHaystack(generator);
      const {
        depth,
        leaves,
        branchingFactor,
        hasArray,
        hasObject
      } = analyzeHaystack(haystack);
      data.depth[depth] = (data.depth[depth] || 0) + 1;
      data.leaves[leaves] = (data.leaves[leaves] || 0) + 1;
      const bf = Math.round(branchingFactor * 2) / 2;
      data.branchingFactors[bf] = (data.branchingFactors[bf] || 0) + 1;
      const type = `${hasArray ? 'A' : ''}${hasObject ? 'O' : ''}`;
      data.types[type] = (data.types[type] || 0) + 1;
    }

    const filename = path.join(`${__filename}__resources`, 'distribution.json');
    const result = fs.smartWrite(filename, data);
    expect(result).to.equal(false);
  });
});
