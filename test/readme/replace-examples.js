import getObjectScanOptions from './replace-examples/get-object-scan-options.js';
import render from './replace-examples/render.js';

export default async (lines_) => {
  const lines = [...lines_];

  let startIndex = -1;
  const content = [];
  let haystack;

  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    if (startIndex !== -1) {
      if (line === '</example></pre>') {
        const meta = content
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
        // eslint-disable-next-line no-await-in-loop
        const rendered = await render(kwargs);
        lines.splice(startIndex, idx - startIndex + 1, ...rendered);
        startIndex = -1;
        content.length = 0;
      } else {
        content.push(line);
      }
    } else if (lines[idx] === '<pre><example>') {
      startIndex = idx;
    }
  }
  return lines;
};
