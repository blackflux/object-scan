import fs from 'smart-fs';
import path from 'path';
import { iterateSuites, iterateTests } from '../iterator.js';
import runBenchmark from './run-benchmark.js';
import suites from '../suites.js';
import getColorForValue from './get-color-for-value.js';
import okLogo from './ok-logo.js';

const growTable = async () => {
  const table = [
    ['   '],
    ['---']
  ];
  const tasks = [];
  iterateSuites(({ suite, tests }) => {
    const { _name: name, _fixture: fixture } = tests;
    table.push([`<a href="./test/comparison/suites/${suite}.js">${name}</a>`]);
    iterateTests(tests, ({ test, fn }) => {
      let col = table[0].indexOf(test);
      if (col === -1) {
        table[0].push(test);
        table[1].push('---');
        col = table[0].length - 1;
      }
      if (fn) {
        const row = table.length - 1;
        tasks.push(async () => {
          table[row][col] = await runBenchmark(suite, test, fixture);
        });
      }
    });
  });
  for (let i = 0; i < tasks.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await tasks[i]();
  }
  return table;
};

const findMinInRow = (table, row) => {
  let minValue = Number.MAX_SAFE_INTEGER;
  for (let col = 1; col < table[row].length; col += 1) {
    const v = table[row][col];
    if (v !== undefined && minValue > v) {
      minValue = v;
    }
  }
  return minValue;
};

const iterateTable = (table, cb) => {
  for (let row = 2; row < table.length; row += 1) {
    const rowMin = findMinInRow(table, row);
    for (let col = 1; col < table[0].length; col += 1) {
      const value = table[row][col];
      // eslint-disable-next-line object-curly-newline
      cb({ row, col, value, rowMin });
    }
  }
};

export default async () => {
  const suiteEntries = Object.entries(suites);
  const table = await growTable();
  const footnotes = {};
  const footer = [''];
  // eslint-disable-next-line object-curly-newline
  iterateTable(table, ({ row, col, rowMin, value }) => {
    if (value !== undefined) {
      const multiplier = value / rowMin;
      const multiplierStr = `${multiplier.toFixed(2)}x`;
      const color = getColorForValue(multiplier).slice(1);
      table[row][col] = `![](https://img.shields.io/badge/${multiplierStr}-${color}?logo=${okLogo})`;
    } else {
      table[row][col] = '-';
    }

    // handle footnotes
    const suite = table[0][col];
    const comment = suiteEntries[row - 2][1]?.[suite]?.comment;
    if (comment) {
      if (!(comment in footnotes)) {
        const footnoteId = Object.keys(footnotes).length + 1;
        footnotes[comment] = ` <i><sup><a href="#timing_ref_${footnoteId}">[${footnoteId}]</a></sup></i>`;
        footer.push(`<a id="timing_ref_${footnoteId}"><i>[${footnoteId}]</i></a>: _${comment}_<br>`);
      }
      table[row][col] += footnotes[comment];
    }
  });
  // rewrite first column with links
  const libs = fs.smartRead(path.join(fs.dirname(import.meta.url), 'libs.json'));
  for (let col = 1; col < table[0].length; col += 1) {
    table[0][col] = libs[table[0][col]];
  }
  // convert rows into strings
  for (let row = 0; row < table.length; row += 1) {
    table[row] = `|${table[row].join('|')}|`;
  }
  table.push(...footer);
  return table;
};
