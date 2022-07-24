import fs from 'smart-fs';
import { join } from 'path';
import { describe } from 'node-tdd';
import { expect } from 'chai';
import replaceTitles from './readme/replace-titles.js';
import replaceVariables from './readme/replace-variables.js';
import replaceExamples from './readme/replace-examples.js';
import verifyLinks from './readme/verify-links.js';

describe('Testing Readme', { timeout: 5 * 60000 }, () => {
  it('Updating Readme Example', async () => {
    const inputFile = join(fs.dirname(import.meta.url), 'readme', 'README.template.md');
    const outputFile = join(fs.dirname(import.meta.url), '..', 'README.md');
    const input = fs.smartRead(inputFile);
    const output = await [
      replaceTitles,
      replaceVariables,
      replaceExamples,
      verifyLinks
    ].reduce(async (c, fn) => fn(await c), input);
    const result = fs.smartWrite(outputFile, output);
    expect(result).to.equal(false);
  });
});
