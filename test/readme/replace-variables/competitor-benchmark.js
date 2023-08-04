import path from 'path';
import fs from 'smart-fs';

export default async (lines) => {
  const dirname = fs.dirname(import.meta.url);
  const filepath = path.join(dirname, '..', '..', 'comparison', 'benchmark', 'result.md');
  return fs.smartRead(filepath);
};
