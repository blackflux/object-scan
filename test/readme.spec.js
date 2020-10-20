const fs = require('smart-fs');
const path = require('path');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const Mustache = require('mustache');
const stringify = require('./helper/stringify');

const parseContent = (content) => {
  const lines = content.trim().split('\n');
  return [
    'haystack',
    'needles',
    'comment',
    'spoiler',
    'joined',
    'filterFn',
    'breakFn'
  ].reduce((p, k) => {
    const line = lines.find((l) => l.startsWith(`${k}:`));
    if (line !== undefined) {
      // eslint-disable-next-line no-param-reassign
      p[k] = line.slice(k.length + 1).trim();
    }
    return p;
  }, {});
};

const mkObjectScanCtx = (context) => Object.entries({
  joined: context.joined || true,
  filterFn: context.filterFn,
  breakFn: context.breakFn
})
  .filter(([k, v]) => v !== undefined)
  .map(([k, v]) => `${k}: ${v}`)
  .join(', ');

const template = fs.smartRead(path.join(__dirname, 'helper', 'resources', 'readme-example.mustache')).join('\n');

describe('Testing Readme', { timeout: 5 * 60000 }, () => {
  it('Updating Readme Example', () => {
    const exampleRegex = /<!-- <example>([\s\S]+?)<\/example> -->/g;
    const file = path.join(__dirname, '..', 'README.md');
    const contentOriginal = fs.smartRead(file).join('\n');
    let haystack = null;
    const contentUpdated = contentOriginal.replace(exampleRegex, (match, content) => {
      const context = parseContent(content);
      const ctx = mkObjectScanCtx(context);
      if (context.haystack) {
        haystack = context.haystack;
      }
      // eslint-disable-next-line no-eval
      const result = eval(`require('../src/index')(${context.needles}, { ${ctx} })(${haystack})`);
      return Mustache.render(template, {
        context: Object.entries(context).map(([key, value]) => ({ key, value })),
        spoiler: context.spoiler !== 'false',
        comment: context.comment,
        haystack,
        needles: context.needles,
        result: stringify(result),
        ctx
      });
    });
    const result = fs.smartWrite(file, contentUpdated.split('\n'));
    expect(result).to.equal(false);
  });
});
