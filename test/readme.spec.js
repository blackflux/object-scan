import fs from 'smart-fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { describe } from 'node-tdd';
import Mustache from 'mustache';
import { expect } from 'chai';
import ncc from '@vercel/ncc';
import Slugger from 'github-slugger';
import stringify from './helper/stringify.js';

const getObjectScanOptions = (meta) => {
  const entries = Object.entries({
    joined: meta.joined === 'false' ? undefined : true,
    filterFn: meta.filterFn,
    breakFn: meta.breakFn,
    beforeFn: meta.beforeFn,
    afterFn: meta.afterFn,
    strict: meta.strict,
    rtn: meta.rtn,
    compareFn: meta.compareFn,
    reverse: meta.reverse,
    orderByNeedles: meta.orderByNeedles,
    abort: meta.abort,
    useArraySelector: meta.useArraySelector
  })
    .filter(([k, v]) => v !== undefined);
  const multiline = entries.length > 1 || 'filterFn' in meta || 'breakFn' in meta;
  const result = entries
    .map(([k, v]) => `${k}: ${v}`)
    .join(multiline ? ',\n  ' : ', ');
  if (result === '') {
    return '';
  }
  return multiline ? `, {\n  ${result}\n}` : `, { ${result} }`;
};

const replaceAsync = async (str, regex, asyncFn) => {
  const tasks = [];
  str.replace(regex, (match, ...args) => {
    tasks.push(() => asyncFn(match, ...args));
  });
  const data = [];
  for (let i = 0; i < tasks.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    data.push(await tasks[i]());
  }
  return str.replace(regex, () => data.shift());
};

const Renderer = () => {
  const templateFile = join(dirname(fileURLToPath(import.meta.url)), 'readme', 'example.mustache');
  const template = fs.smartRead(templateFile).join('\n');

  let haystack;
  return async (match, content) => {
    if (match.startsWith('${') && match.endsWith('}')) {
      return {
        SIZE_BADGE: async () => {
          const indexFile = join(fs.dirname(import.meta.url), '..', 'src', 'index.js');
          const { code } = await ncc(indexFile, { minify: true });
          const sizeInBytes = Buffer.byteLength(code, 'utf8');
          const size = `${(sizeInBytes / 1024).toFixed(2)}%20KB`;
          const link = 'https://cdn.jsdelivr.net/npm/object-scan/lib/';
          return `[![Size](https://shields.io/badge/minified-${size}-informational)](${link})`;
        },
        CMP_BMK: async () => fs.smartRead(join(
          dirname(fileURLToPath(import.meta.url)),
          'comparison',
          'benchmark.md'
        )).join('\n')
      }[match.slice(2, -1)]();
    }

    const meta = content
      .split('\n')
      .map((l) => /^(?<key>[a-zA-Z0-9]+): (?<value>.*)$/.exec(l).groups)
      .reduce((obj, { key, value }) => Object.assign(obj, { [key]: value }), {});
    const options = getObjectScanOptions(meta);
    const context = meta.context ? `, ${meta.context}` : '';
    if (meta.haystack) {
      haystack = meta.haystack;
    }
    const kwargs = {
      spoiler: meta.spoiler !== 'false',
      comment: meta.comment,
      haystack,
      needles: meta.needles,
      context,
      result: null,
      options
    };

    let result;
    try {
      const p1 = `${meta.needles}${options}`;
      const p2 = `${haystack}${context}`;
      const c = `import('../src/index.js').then((idx) => idx.default(${p1})(${p2}));`;
      // eslint-disable-next-line no-eval
      result = await eval(c);
    } catch (e) {
      result = String(e);
    }
    kwargs.result = stringify(result);
    return Mustache.render(template, kwargs);
  };
};

const injectToc = (input) => {
  const lines = input.split('\n');
  const stack = [];
  const toc = [];
  let tocIndex = -1;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    // eslint-disable-next-line no-template-curly-in-string
    if (line === '${{TOC}}') {
      tocIndex = i;
    }
    if (!/^#+ /.test(line)) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const indexOfFirstSpace = line.indexOf(' ');
    const indent = line.substring(0, indexOfFirstSpace);
    const title = line.substring(indexOfFirstSpace + 1);
    const type = indent.length - 2;
    if (type < 0) {
      // eslint-disable-next-line no-continue
      continue;
    }
    stack.length = type + 1;
    if (!stack[type]) {
      stack[type] = 0;
    }
    stack[type] += 1;
    const number = `${stack.join('.')}.`;
    lines[i] = `${indent} ${number} ${title}`;
    const ctx = { start: false, end: false };
    toc.push([type, number, title, ctx]);
  }

  for (let i = 0; i < toc.length; i += 1) {
    const cur = toc[i][0];
    const next = toc[i + 1]?.[0] || 0;
    toc[i][3].start = cur === 0 && next === 1;
    toc[i][3].end = cur === 1 && next === 0;
  }

  const slugger = new Slugger();
  for (let i = 0; i < toc.length;) {
    const [type, number, title, ctx] = toc[i];
    const color = `${['#106ea1', '#c96c01'][type].slice(1)}`;
    const space = ' ';
    const indent = space.repeat(type);

    const slug = slugger.slug(`${number} ${title}`);
    const result = [];
    const img = `https://shields.io/badge/${number}-${title.replace(/ /g, '%20')}-${color}?style=for-the-badge`;
    const text = `<a href="#${slug}"><img alt="${title}" src="${img}"></a>`;
    if (ctx.start) {
      result.push(`<details><summary>${text}</summary>`);
    } else if (ctx.end) {
      result.push(`${indent}${space}${space}${text}</details>`);
    } else if (type === 0) {
      result.push(`<p>${indent}${space}${space}${text}</p>`);
    } else {
      result.push(`${indent}${space}${space}${text}<br>`);
    }
    toc.splice(i, 1, ...result);
    i += result.length;
  }

  lines.splice(tocIndex, 1, ...toc);

  return lines;
};

describe('Testing Readme', { timeout: 5 * 60000 }, () => {
  it('Updating Readme Example', async () => {
    const inputFile = join(dirname(fileURLToPath(import.meta.url)), 'readme', 'README.template.md');
    const outputFile = join(dirname(fileURLToPath(import.meta.url)), '..', 'README.md');
    const input = fs.smartRead(inputFile).join('\n');
    const renderer = Renderer();
    const output = injectToc(await replaceAsync(
      input,
      /<pre><example>\n([\s\S]+?)\n<\/example><\/pre>|\$\{[A-Z_]+}/g,
      renderer
    ));
    const result = fs.smartWrite(outputFile, output);
    expect(result).to.equal(false);
  });
});
