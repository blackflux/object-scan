import fs from 'fs';
import path from 'path';
import { createPatch } from 'diff';
import { html } from 'diff2html';

const template = fs.readFileSync(path.join(
  __dirname, 'resources', 'diff-template.mustache'
)).toString('utf8');

export default (name, log1, log2, meta = null) => {
  const str1 = JSON.stringify(log1, null, 2);
  const str2 = JSON.stringify(log2, null, 2);

  const filename = `${name}.html`;
  const diff = createPatch(filename, str1, str2, null, null, { context: 100 });

  const diffHtml = html(diff, {
    drawFileList: false,
    outputFormat: 'side-by-side',
    maxLineSizeInBlockForComparison: 100000,
    rawTemplates: {
      'generic-wrapper': template
    }
  });
  return diffHtml
    .replace(
      '</body>',
      meta === null
        ? '</body>'
        : `<pre><code class="prettyprint">\n${JSON.stringify(meta, null, 2)}\n</code></pre>\n</body>`
    )
    .replace(/\n\s+\n/, '\n');
};
