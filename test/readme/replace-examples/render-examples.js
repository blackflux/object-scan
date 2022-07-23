import getObjectScanOptions from './get-object-scan-options.js';
import render from './render.js';

export default async (examples) => {
  const result = [];

  let haystack;
  for (let idx = 0; idx < examples.length; idx += 1) {
    const [start, end, content] = examples[idx];
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
    result.push([start, end, rendered]);
  }

  return result;
};
