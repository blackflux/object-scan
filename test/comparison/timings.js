import fs from 'smart-fs';
import path from 'path';
import * as fixtures from './fixtures.js';
import * as suites from './suites.js';

const COUNT = 10000;

const execute = () => {
  const table = [
    [' '],
    ['---']
  ];
  const footnotes = {};
  const entries = Object.entries(suites);
  entries
    .sort(([, { _index: a }], [, { _index: b }]) => a - b)
    .forEach(([suite, tests]) => {
      const { _name: name } = tests;
      table.push([`<a href="./test/comparison/suites/${suite}.js">${name}</a>`]);
      Object.entries(tests)
        .filter(([test]) => !test.startsWith('_'))
        .forEach(([test, fnOrObj]) => {
          let col = table[0].indexOf(test);
          if (col === -1) {
            table[0].push(test);
            table[1].push('---');
            col = table[0].length - 1;
          }
          const { fn } = typeof fnOrObj === 'function'
            ? { fn: fnOrObj, result: tests.result }
            : fnOrObj;
          const start = process.hrtime();
          const { _fixture: fixture } = tests;
          for (let i = 0; i < COUNT; i += 1) {
            fn(fixtures[fixture]);
          }
          const stop = process.hrtime(start);
          table[table.length - 1][col] = (stop[0] * 1e9 + stop[1]) / (COUNT * 1000);
        });
    });
  for (let j = 2; j < table.length; j += 1) {
    let minPos = -1;
    let minValue = Number.MAX_SAFE_INTEGER;
    let maxPos = -1;
    let maxValue = Number.MIN_SAFE_INTEGER;
    for (let i = 1; i < table[0].length; i += 1) {
      const v = table[j][i];
      if (v === undefined) {
        table[j][i] = "<span style='color:#ff0000'>✘</span>";
      } else {
        if (minValue > v) {
          minValue = v;
          minPos = i;
        }
        if (maxValue < v) {
          maxValue = v;
          maxPos = i;
        }
        table[j][i] = `${v.toFixed(2)} μs`;
      }
      const { _comments: comments } = entries[j - 2][1];
      const suite = table[0][i];
      const comment = comments?.[suite];
      if (comment) {
        if (!(comment in footnotes)) {
          footnotes[comment] = Object.keys(footnotes).length + 1;
        }
        const footnoteId = footnotes[comment];
        table[j][i] = `${table[j][i]}<i><sup><a href="#timing_ref_${footnoteId}">[${footnoteId}]</a></sup></i>`;
      }
    }
    table[j][minPos] = `<span style="color:#1f811f">${table[j][minPos]}</span>`;
    table[j][maxPos] = `<span style="color:#b01414">${table[j][maxPos]}</span>`;
  }
  for (let i = 0; i < table.length; i += 1) {
    table[i] = `|${table[i].join('|')}|`;
  }
  table.push('');
  Object.entries(footnotes).forEach((([comment, footnoteId]) => {
    table.push(`<a id="timing_ref_${footnoteId}">[${footnoteId}]</a>: ${comment}<br>`);
  }));
  fs.smartWrite(path.join(fs.dirname(import.meta.url), 'timings.md'), table);
};
execute();
