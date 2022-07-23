import fs from 'smart-fs';
import path from 'path';
import zlib from 'zlib';
import ncc from '@vercel/ncc';
import Mustache from 'mustache/mustache.js';
import getObjectScanOptions from './get-object-scan-options.js';
import stringify from '../helper/stringify.js';

// todo: refactor
export default () => {
  const dirname = fs.dirname(import.meta.url);
  const templateFile = path.join(dirname, 'example.mustache');
  const template = fs.smartRead(templateFile).join('\n');

  let haystack;
  return async (match, content) => {
    if (match.startsWith('${') && match.endsWith('}')) {
      return {
        SIZE_BADGE: async () => {
          const indexFile = path.join(dirname, '..', '..', 'src', 'index.js');
          const { code } = await ncc(indexFile, { minify: true });
          const sizeInBytes = zlib.gzipSync(code, { level: 9 }).length;
          const size = `${(sizeInBytes / 1024).toFixed(2)}%20KB`;
          const link = 'https://cdn.jsdelivr.net/npm/object-scan/lib/';
          return `[![Size](https://shields.io/badge/minified%20+%20gzip-${size}-informational)](${link})`;
        },
        CMP_BMK: async () => {
          const filepath = path.join(dirname, '..', 'comparison', 'benchmark', 'result.md');
          return fs.smartRead(filepath).join('\n');
        }
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
      const c = `import('../../src/index.js').then((idx) => idx.default(${p1})(${p2}));`;
      // eslint-disable-next-line no-eval
      result = await eval(c);
    } catch (e) {
      result = String(e);
    }
    kwargs.result = stringify(result);
    return Mustache.render(template, kwargs);
  };
};
