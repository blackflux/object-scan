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

const enrichTasks = (() => {
  let haystack;

  const getMetaEntries = (start, end, lines) => {
    const result = [];
    for (let j = start + 1; j < end; j += 1) {
      const data = /^(?<key>[a-zA-Z0-9]+): (?<value>.*)$/.exec(lines[j]);
      if (!data) {
        break;
      }
      result.push(data.groups);
    }
    return result;
  };

  const getObjectScanCtx = (meta) => Object.entries({
    joined: meta.joined || true,
    filterFn: meta.filterFn,
    breakFn: meta.breakFn,
    useArraySelector: meta.useArraySelector
  })
    .filter(([k, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  return (tasks, lines) => {
    for (let idx = 0; idx < tasks.length; idx += 1) {
      const task = tasks[idx];
      task.metaEntries = getMetaEntries(task.start, task.end, lines);
      task.meta = task.metaEntries
        .reduce((obj, { key, value }) => Object.assign(obj, { [key]: value }), {});
      task.ctx = getObjectScanCtx(task.meta);
      if (task.meta.haystack) {
        haystack = task.meta.haystack;
      }
      task.haystack = haystack;
    }
  };
})();

const applyTasks = (() => {
  const render = (() => {
    const templateFile = path.join(__dirname, 'readme', 'example.mustache');
    const template = fs.smartRead(templateFile).join('\n');
    return (task) => {
      const { meta, ctx, haystack } = task;
      const { needles, comment } = meta;
      let result;
      try {
        // eslint-disable-next-line no-eval
        result = eval(`require('../src/index')(${needles}, { ${ctx} })(${haystack})`);
      } catch (e) {
        result = String(e);
      }
      return Mustache.render(template, {
        meta: task.metaEntries,
        spoiler: meta.spoiler !== 'false',
        comment,
        haystack,
        needles,
        result: stringify(result),
        ctx
      });
    };
  })();

  return (lines, tasks) => {
    tasks
      .sort(({ start: startA }, { start: startB }) => startB - startA)
      .forEach((task) => {
        const replacement = render(task);
        lines.splice(task.start, task.end - task.start + 1, ...replacement.split('\n'));
      });
  };
})();

describe('Testing Readme', { timeout: 5 * 60000 }, () => {
  it('Updating Readme Example', () => {
    const inputFile = path.join(__dirname, 'readme', 'README.raw.md');
    const outputFile = path.join(__dirname, '..', 'README.md');

    const lines = fs.smartRead(inputFile);
    const tasks = findTasks(lines);
    enrichTasks(tasks, lines);
    applyTasks(lines, tasks);
    const result = fs.smartWrite(outputFile, lines);
    expect(result).to.equal(false);
  });
});
