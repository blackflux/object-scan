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
        TEST_RATIO_BADGE: async () => {
          const root = path.join(dirname, '..', '..');
          const computeSize = (folder, files) => files.reduce((c, f) => c + fs.statSync(path.join(folder, f)).size, 0);
          const srcFolder = path.join(root, 'src');
          const testFolder = path.join(root, 'test');
          const srcFiles = fs.walkDir(srcFolder).filter((f) => f.endsWith('.js'));
          const testFiles = fs.walkDir(testFolder).filter((f) => f.endsWith('.js'));
          const srcSize = computeSize(srcFolder, srcFiles);
          const testSize = computeSize(testFolder, testFiles);
          const ratio = `${(testSize / srcSize).toFixed(1)}%20:%20${srcSize / srcSize}`;
          const filename = fs.filename(import.meta.url);
          const relpath = path.relative(root, filename);
          return `[![Test Ratio](https://shields.io/badge/test%20:%20code-${ratio}-informational)](./${relpath})`;
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
