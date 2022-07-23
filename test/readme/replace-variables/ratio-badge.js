import fs from 'smart-fs';
import path from 'path';

export default async (lines) => {
  const dirname = fs.dirname(import.meta.url);
  const root = path.join(dirname, '..', '..', '..');
  const computeSize = (folder, files) => files.reduce((c, f) => c + fs.statSync(path.join(folder, f)).size, 0);
  const srcFolder = path.join(root, 'src');
  const testFolder = path.join(root, 'test');
  const srcFiles = fs.walkDir(srcFolder).filter((f) => f.endsWith('.js'));
  const testFiles = fs.walkDir(testFolder).filter((f) => f.endsWith('.js'));
  const srcSize = computeSize(srcFolder, srcFiles);
  const testSize = computeSize(testFolder, testFiles);
  const ratio = `${(testSize / srcSize).toFixed(1)}%20:%20${srcSize / srcSize}`;
  const filename = fs.filename(import.meta.url);
  const relpath = path.relative(root, filename);
  return [`[![Test Ratio](https://shields.io/badge/test%20:%20code-${ratio}-informational)](./${relpath})`];
};
