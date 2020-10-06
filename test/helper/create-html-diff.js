const fs = require('fs');
const path = require('path');
const jsdiff = require('diff');
const Diff2html = require('diff2html');

const template = fs.readFileSync(path.join(
  __dirname, 'resources', 'diff-template.mustache'
)).toString('utf8');

module.exports = (name, log1, log2) => {
  const str1 = JSON.stringify(log1, null, 2);
  const str2 = JSON.stringify(log2, null, 2);

  const filename = `${name}.html`;
  const diff = jsdiff.createPatch(filename, str1, str2, null, null, { context: 100 });

  const diffHtml = Diff2html.html(diff, {
    drawFileList: false,
    outputFormat: 'side-by-side',
    maxLineSizeInBlockForComparison: 100000,
    rawTemplates: {
      'generic-wrapper': template
    }
  });
  return diffHtml.replace(/\n\s+\n/, '\n');
};
