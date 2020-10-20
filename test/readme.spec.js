const fs = require('smart-fs');
const path = require('path');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const Mustache = require('mustache');
const stringify = require('./helper/stringify');

const getObjectScanOptions = (meta) => {
  const multiline = meta.filterFn !== undefined || meta.breakFn !== undefined;
  const result = Object.entries({
    joined: meta.joined === 'false' ? undefined : true,
    filterFn: meta.filterFn,
    breakFn: meta.breakFn,
    useArraySelector: meta.useArraySelector
  })
    .filter(([k, v]) => v !== undefined)
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
    const metaEntries = content
      .split('\n')
      .map((l) => /^(?<key>[a-zA-Z0-9]+): (?<value>.*)$/.exec(l).groups);
    const meta = metaEntries
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
      meta: metaEntries,
      spoiler: meta.spoiler !== 'false',
      comment: meta.comment,
      haystack,
      needles: meta.needles,
      context,
      result: stringify(result),
      options
    });
  };
};

describe('Testing Readme', { timeout: 5 * 60000 }, () => {
  it('Updating Readme Example', () => {
    const inputFile = path.join(__dirname, 'readme', 'README.raw.md');
    const outputFile = path.join(__dirname, '..', 'README.md');
    const input = fs.smartRead(inputFile).join('\n');
    const renderer = Renderer();
    const output = input.replace(/<!-- <example>\n([\s\S]+?)\n<\/example> -->/g, renderer);
    const result = fs.smartWrite(outputFile, output.split('\n'));
    expect(result).to.equal(false);
  });
});
