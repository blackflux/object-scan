import path from 'path';
import zlib from 'zlib';
import fs from 'smart-fs';
import ncc from '@vercel/ncc';

export default async (lines) => {
  const dirname = fs.dirname(import.meta.url);
  const indexFile = path.join(dirname, '..', '..', '..', 'src', 'index.js');
  const { code } = await ncc(indexFile, { minify: true });
  const sizeInBytes = zlib.gzipSync(code, { level: 9 }).length;
  const size = `${(sizeInBytes / 1024).toFixed(2)}%20KB`;
  const link = 'https://bundlephobia.com/package/object-scan';
  return [`[![Size](https://shields.io/badge/min%20+%20gz-${size}-informational)](${link})`];
};
