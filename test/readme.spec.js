const util = require('util');
const fs = require('smart-fs');
const path = require('path');
const expect = require('chai').expect;
const { describe } = require('node-tdd');

const mkSpoiler = (titleCode, titleComment, code) => {
  const head = [
    '<details>',
    '<summary> ',
    `<code>${titleCode}</code> `,
    titleComment ? `<em>(${titleComment})</em> ` : '',
    '</summary>'
  ].join('');
  return [
    head,
    '',
    ...code,
    '</details>'
  ];
};

const parseContent = (content) => {
  const lines = content.trim().split('\n');
  const context = [
    'haystack',
    'needles',
    'comment',
    'spoiler',
    'joined',
    'filterFn',
    'breakFn'
  ].reduce((p, k) => {
    const line = lines.find((l) => l.startsWith(`${k} =`));
    if (line !== undefined) {
      // eslint-disable-next-line no-param-reassign
      p[k] = line.slice(k.length + 2).trim();
    }
    return p;
  }, {});
  const contextString = Object.entries(context).map(([k, v]) => `${k} = ${v}`).join('\n');
  return {
    context,
    contextString
  };
};

const mkObjectScanCtx = (context) => Object.entries({
  joined: context.joined || true,
  filterFn: context.filterFn,
  breakFn: context.breakFn
})
  .filter(([k, v]) => v !== undefined)
  .map(([k, v]) => `${k}: ${v}`)
  .join(', ');

const mkTemplate = ({
  haystack, result, ctx, context, contextString
}) => {
  const code = [
    '<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->',
    '```js',
    "const objectScan = require('object-scan');",
    '',
    `const haystack = ${haystack};`,
    '',
    `objectScan(${context.needles}, { ${ctx} })(haystack);`,
    `// => ${util.inspect(result, { showHidden: false, depth: null })}`,
    '```'
  ];

  return [
    '<!-- <example>',
    contextString,
    '-->',
    ...(context.spoiler === 'false'
      ? code
      : mkSpoiler(context.needles, context.comment, code)),
    '<!--',
    '</example> -->'
  ].join('\n');
};

describe('Testing Readme', { timeout: 5 * 60000 }, () => {
  it('Updating Readme Example', () => {
    const exampleRegex = /<!-- <example>([\s\S]+?)<\/example> -->/g;
    const file = path.join(__dirname, '..', 'README.md');
    const contentOriginal = fs.smartRead(file).join('\n');
    let haystack = null;
    const contentUpdated = contentOriginal.replace(exampleRegex, (match, content) => {
      const { context, contextString } = parseContent(content);
      const ctx = mkObjectScanCtx(context);
      if (context.haystack) {
        haystack = context.haystack;
      }
      // eslint-disable-next-line no-eval
      const result = eval(`require('../src/index')(${context.needles}, { ${ctx} })(${haystack})`);
      return mkTemplate({
        haystack, result, ctx, context, contextString
      });
    });
    const result = fs.smartWrite(file, contentUpdated.split('\n'));
    expect(result).to.equal(false);
  });
});
