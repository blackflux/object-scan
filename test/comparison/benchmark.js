import fs from 'smart-fs';
import path from 'path';
import suites from './suites.js';
import * as fixtures from './fixtures.js';

const COUNT = 10000;

const COLORS = [
  [1, '#1f811f'],
  [5, '#dcb517'],
  [10, '#d96a0f'],
  [20, '#b01414']
];

const blendColors = (colorA, colorB, amount) => {
  const [rA, gA, bA] = colorA.match(/[^#]{2}/g).map((c) => parseInt(c, 16));
  const [rB, gB, bB] = colorB.match(/[^#]{2}/g).map((c) => parseInt(c, 16));
  const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
  const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
  const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
};

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
    let minValue = Number.MAX_SAFE_INTEGER;
    for (let i = 1; i < table[0].length; i += 1) {
      const v = table[j][i];
      if (v !== undefined && minValue > v) {
        minValue = v;
      }
    }
    for (let i = 1; i < table[0].length; i += 1) {
      const v = table[j][i];
      const { _comments: comments } = entries[j - 2][1];
      const suite = table[0][i];
      const comment = comments?.[suite];
      table[j][i] = v === undefined ? ':heavy_check_mark:' : ':x:';
      if (comment) {
        if (!(comment in footnotes)) {
          footnotes[comment] = Object.keys(footnotes).length + 1;
        }
        const footnoteId = footnotes[comment];
        const footnote = `<i><sup><a href="#timing_ref_${footnoteId}">[${footnoteId}]</a></sup></i>`;
        table[j][i] += footnote;
      }
      if (v !== undefined) {
        const multiplier = (v / minValue).toFixed(2);
        for (let idx1 = 0; idx1 < COLORS.length; idx1 += 1) {
          const idx2 = Math.min(idx1 + 1, COLORS.length - 1);
          if (
            idx1 === idx2
            || (COLORS[idx1][0] <= multiplier && multiplier <= COLORS[idx2][0])
          ) {
            const factor = Math.min(1, Math.max(0, Math.abs(
              (multiplier - COLORS[idx1][0]) / (COLORS[idx2][0] - COLORS[idx1][0])
            )));
            const color = blendColors(COLORS[idx1][1], COLORS[idx2][1], factor);
            table[j][i] += ` ![](https://img.shields.io/badge/${
              (v / minValue).toFixed(2)
            }x-${
              color.slice(1)
            })`;
            break;
          }
        }
      }
    }
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
