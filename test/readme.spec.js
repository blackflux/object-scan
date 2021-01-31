const fs = require('smart-fs');
const path = require('path');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const Mustache = require('mustache');
const stringify = require('./helper/stringify');

const getObjectScanOptions = (meta) => {
  const entries = Object.entries({
    joined: meta.joined === 'false' ? undefined : true,
    filterFn: meta.filterFn,
    breakFn: meta.breakFn,
    strict: meta.strict,
    rtn: meta.rtn,
    compareFn: meta.compareFn,
    reverse: meta.reverse,
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

const Renderer = () => {
  const templateFile = path.join(__dirname, 'readme', 'example.mustache');
  const template = fs.smartRead(templateFile).join('\n');

  let haystack;
  return (match, content) => {
    const meta = content
      .split('\n')
      .map((l) => /^(?<key>[a-zA-Z0-9]+): (?<value>.*)$/.exec(l).groups)
      .reduce((obj, { key, value }) => Object.assign(obj, { [key]: value }), {});
    const options = getObjectScanOptions(meta);
    const context = meta.context ? `, ${meta.context}` : '';
    if (meta.haystack) {
      haystack = meta.haystack;
    }

    let result;
    try {
      // eslint-disable-next-line no-eval
      result = eval(`require('../src/index')(${meta.needles}${options})(${haystack}${context})`);
    } catch (e) {
      result = String(e);
    }
    return Mustache.render(template, {
      spoiler: meta.spoiler !== 'false',
      comment: meta.comment,
      haystack,
      needles: meta.needles,
      context,
      result: stringify(result).replace(/\\/g, '\\\\'),
      options
    });
  };
};

describe('Testing Readme', { timeout: 5 * 60000 }, () => {
  it('Updating Readme Example', () => {
    const inputFile = path.join(__dirname, 'readme', 'README.template.md');
    const outputFile = path.join(__dirname, '..', 'README.md');
    const input = fs.smartRead(inputFile).join('\n');
    const renderer = Renderer();
    const output = input.replace(/<pre><example>\n([\s\S]+?)\n<\/example><\/pre>/g, renderer);
    const result = fs.smartWrite(outputFile, output.split('\n'));
    expect(result).to.equal(false);
  });
});
