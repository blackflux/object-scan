import fs from 'smart-fs';
import path from 'path';
import genTable from './benchmark/gen-table.js';

const execute = () => fs.smartWrite(
  path.join(fs.dirname(import.meta.url), 'benchmark', 'result.md'),
  genTable()
);
execute();
