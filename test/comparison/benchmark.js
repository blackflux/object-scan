import fs from 'smart-fs';
import path from 'path';
import suites from './suites.js';
import * as fixtures from './fixtures.js';

const COUNT = 10000;

const execute = (optimize) => {
  const table = [
    [`_[v8 ${[optimize ? '--opt' : '--no-opt']}](https://flaviocopes.com/node-runtime-v8-options/)_`],
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
        .filter(([lib]) => !lib.startsWith('_'))
        .forEach(([lib, fnOrObj]) => {
          let col = table[0].indexOf(lib);
          if (col === -1) {
            table[0].push(lib);
            table[1].push('---');
            col = table[0].length - 1;
          }
          const { fn } = typeof fnOrObj === 'function'
            ? { fn: fnOrObj, result: tests.result }
            : fnOrObj;

          const { _fixture: fixture } = tests;
          if (optimize) {
            for (let i = 0; i < COUNT; i += 1) {
              fn(fixtures[fixture]);
            }
          }
          const start = process.hrtime();
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
      if (v !== undefined) {
        if (minValue > v) {
          minValue = v;
          minPos = i;
        }
        if (maxValue < v) {
          maxValue = v;
          maxPos = i;
        }
      }
    }
    for (let i = 1; i < table[0].length; i += 1) {
      const v = table[j][i];
      const { _comments: comments } = entries[j - 2][1];
      const suite = table[0][i];
      const comment = comments?.[suite];
      const status = v === undefined
        ? "<span style='color:#ff0000'>✘</span>"
        : "<span style='color:#00ff00'>✔</span>";
      const append = v === undefined
        ? ''
        : ` ${(v / minValue).toFixed(2)}x`;
      if (comment) {
        if (!(comment in footnotes)) {
          footnotes[comment] = Object.keys(footnotes).length + 1;
        }
        const footnoteId = footnotes[comment];
        const footnote = `<i><sup><a href="#timing_ref_${footnoteId}">[${footnoteId}]</a></sup></i>`;
        table[j][i] = `${status}${footnote}${append}`;
      } else {
        table[j][i] = `${status}${append}`;
      }
    }
    table[j][minPos] = `<span style="color:#1f811f">${table[j][minPos]}</span>`;
    table[j][maxPos] = `<span style="color:#b01414">${table[j][maxPos]}</span>`;
  }
  const libs = fs.smartRead(path.join(fs.dirname(import.meta.url), 'libs.json'));
  for (let i = 1; i < table[0].length; i += 1) {
    table[0][i] = libs[table[0][i]];
  }
  for (let i = 0; i < table.length; i += 1) {
    table[i] = `|${table[i].join('|')}|`;
  }
  fs.smartWrite(path.join(fs.dirname(import.meta.url), `benchmark-opt:${optimize}.md`), table);
  const footer = [];
  Object.entries(footnotes).forEach((([comment, footnoteId]) => {
    footer.push(`<a id="timing_ref_${footnoteId}"><i>[${footnoteId}]</i></a>: ${comment}<br>`);
  }));
  fs.smartWrite(path.join(fs.dirname(import.meta.url), 'benchmark-footer.md'), footer);
};
execute(!process.execArgv.includes('--no-opt'));
