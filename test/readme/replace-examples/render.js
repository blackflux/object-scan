import path from 'path';
import fs from 'smart-fs';
import Mustache from 'mustache/mustache.js';
import stringify from '../../helper/stringify.js';

const dirname = fs.dirname(import.meta.url);
const templateFile = path.join(dirname, 'template.mustache');
const template = fs.smartRead(templateFile).join('\n');

export default async (kwargs) => {
  let result;
  try {
    const p1 = `${kwargs.needles}${kwargs.options}`;
    const p2 = `${kwargs.haystack}${kwargs.context}`;
    const c = `import('../../../src/index.js').then((idx) => idx.default(${p1})(${p2}));`;
    // eslint-disable-next-line no-eval
    result = await eval(c);
  } catch (e) {
    result = String(e);
  }
  return Mustache.render(template, { ...kwargs, result: stringify(result) }).split('\n');
};
