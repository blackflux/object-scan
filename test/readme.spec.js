import fs from 'smart-fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { describe } from 'node-tdd';
import { expect } from 'chai';
import replaceAsync from './helper/replace-async.js';
import Renderer from './readme/renderer.js';
import injectToc from './readme/inject-toc.js';

describe('Testing Readme', { timeout: 5 * 60000 }, () => {
  it('Updating Readme Example', async () => {
    const inputFile = join(dirname(fileURLToPath(import.meta.url)), 'readme', 'README.template.md');
    const outputFile = join(dirname(fileURLToPath(import.meta.url)), '..', 'README.md');
    const input = fs.smartRead(inputFile).join('\n');
    const renderer = Renderer();
    const rendered = (await replaceAsync(
      input,
      /<pre><example>\n([\s\S]+?)\n<\/example><\/pre>|\$\{[A-Z_]+}/g,
      renderer
    )).split('\n');
    const output = injectToc(rendered);
    const result = fs.smartWrite(outputFile, output);
    expect(result).to.equal(false);
  });
});
