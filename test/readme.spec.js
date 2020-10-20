const fs = require('smart-fs');
const path = require('path');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const Mustache = require('mustache');
const stringify = require('./helper/stringify');

const extractContentMeta = (content) => content
  .split('\n')
  .map((l) => l.trim())
  .map((l) => /^(?<key>[a-zA-Z0-9]+): (?<value>.*)$/.exec(l))
  .filter((e) => e !== null)
  .map((e) => e.groups);

const mkObjectScanCtx = (meta) => Object.entries({
  joined: meta.joined || true,
  filterFn: meta.filterFn,
  breakFn: meta.breakFn
})
  .filter(([k, v]) => v !== undefined)
  .map(([k, v]) => `${k}: ${v}`)
  .join(', ');

const render = (() => {
  const templateFile = path.join(__dirname, 'helper', 'resources', 'readme-example.mustache');
  const template = fs.smartRead(templateFile).join('\n');
  return (payload) => Mustache.render(template, payload);
})();

describe('Testing Readme', { timeout: 5 * 60000 }, () => {
  it('Updating Readme Example', () => {
    const exampleRegex = /<!-- <example>([\s\S]+?)<\/example> -->/g;
    const file = path.join(__dirname, '..', 'README.md');
    const contentOriginal = fs.smartRead(file).join('\n');
    let haystack = null;
    const contentUpdated = contentOriginal.replace(exampleRegex, (match, content) => {
      const metaEntries = extractContentMeta(content);
      const meta = metaEntries
        .reduce((obj, { key, value }) => Object.assign(obj, { [key]: value }), {});
      const ctx = mkObjectScanCtx(meta);
      if (meta.haystack) {
        haystack = meta.haystack;
      }
      // eslint-disable-next-line no-eval
      const result = eval(`require('../src/index')(${meta.needles}, { ${ctx} })(${haystack})`);
      return render({
        meta: metaEntries,
        spoiler: meta.spoiler !== 'false',
        comment: meta.comment,
        haystack,
        needles: meta.needles,
        result: stringify(result),
        ctx
      });
    });
    const result = fs.smartWrite(file, contentUpdated.split('\n'));
    expect(result).to.equal(false);
  });
});
