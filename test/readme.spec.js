const fs = require('smart-fs');
const path = require('path');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const Mustache = require('mustache');
const stringify = require('./helper/stringify');

const findTasks = (lines) => {
  const result = [];
  lines.forEach((line, idx) => {
    if (line.startsWith('<!-- <example>')) {
      result.push({ start: idx });
    }
    if (line.startsWith('</example> -->')) {
      result[result.length - 1].end = idx;
    }
  });
  return result;
};

const enrichTaskMeta = (tasks, lines) => {
  tasks.forEach((task) => {
    // eslint-disable-next-line no-param-reassign
    task.metaEntries = [];
    for (let j = task.start + 1; j < task.end; j += 1) {
      const data = /^(?<key>[a-zA-Z0-9]+): (?<value>.*)$/.exec(lines[j]);
      if (!data) {
        break;
      }
      task.metaEntries.push(data.groups);
    }
    // eslint-disable-next-line no-param-reassign
    task.meta = task.metaEntries
      .reduce((obj, { key, value }) => Object.assign(obj, { [key]: value }), {});
  });
};

const enrichTasks = (() => {
  let haystack = null;

  const mkObjectScanCtx = (meta) => Object.entries({
    joined: meta.joined || true,
    filterFn: meta.filterFn,
    breakFn: meta.breakFn
  })
    .filter(([k, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const render = (() => {
    const templateFile = path.join(__dirname, 'helper', 'resources', 'readme-example.mustache');
    const template = fs.smartRead(templateFile).join('\n');
    return (payload) => Mustache.render(template, payload);
  })();

  return (tasks, lines) => {
    tasks.forEach((task) => {
      const { meta } = task;
      const ctx = mkObjectScanCtx(meta);
      if (meta.haystack) {
        haystack = meta.haystack;
      }
      // eslint-disable-next-line no-eval
      const result = eval(`require('../src/index')(${meta.needles}, { ${ctx} })(${haystack})`);
      const replacement = render({
        meta: task.metaEntries,
        spoiler: meta.spoiler !== 'false',
        comment: meta.comment,
        haystack,
        needles: meta.needles,
        result: stringify(result),
        ctx
      });
      // eslint-disable-next-line no-param-reassign
      task.replacement = replacement;
    });
  };
})();

const applyTasks = (tasks, lines) => {
  tasks.reverse().forEach(({ start, end, replacement }) => {
    lines.splice(start, end - start + 1, ...replacement.split('\n'));
  });
};

describe('Testing Readme', { timeout: 5 * 60000 }, () => {
  it('Updating Readme Example', () => {
    const readmeFile = path.join(__dirname, '..', 'README.md');
    const lines = fs.smartRead(readmeFile);
    const tasks = findTasks(lines);
    enrichTaskMeta(tasks, lines);
    enrichTasks(tasks, lines);
    applyTasks(tasks, lines);
    const result = fs.smartWrite(readmeFile, lines);
    expect(result).to.equal(false);
  });
});
