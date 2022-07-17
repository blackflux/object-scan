import fs from 'smart-fs';
import path from 'path';
import * as fixtures from './fixtures.js';
import * as suites from './suites.js';

const execute = () => {
  const table = [
    [' '],
    ['---']
  ];
  Object.entries(suites).forEach(([suite, tests]) => {
    table.push([
      `<a href="./test/comparison/suites/${suite}.js">${
        suite.replace(/^./, (c) => c.toUpperCase())
      }</a>`
    ]);
    Object.entries(tests)
      .filter(([test]) => !['fixture', 'result'].includes(test))
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
        for (let i = 0; i < 10000; i += 1) {
          fn(fixtures[tests.fixture]);
        }
        const stop = process.hrtime(start);
        table[table.length - 1][col] = (stop[0] * 1e9 + stop[1]) / 1e6;
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
        table[j][i] = '-';
      } else {
        if (minValue > v) {
          minValue = v;
          minPos = i;
        }
        if (maxValue < v) {
          maxValue = v;
          maxPos = i;
        }
        table[j][i] = `${v.toFixed(2)} ms`;
      }
    }
    table[j][minPos] = `<a style="color:#1f811f">${table[j][minPos]}</a>`;
    table[j][maxPos] = `<a style="color:#b01414">${table[j][maxPos]}</a>`;
  }
  for (let i = 0; i < table.length; i += 1) {
    table[i] = `|${table[i].join('|')}|`;
  }
  fs.smartWrite(path.join(fs.dirname(import.meta.url), 'timings.md'), table);
};
execute();
