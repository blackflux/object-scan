import assert from 'assert';
import fs from 'smart-fs';
import path from 'path';

const root = path.join(fs.dirname(import.meta.url), '..', '..', '..');

export default async (rels, content) => {
  for (let i = 0; i < rels.length; i += 1) {
    const rel = rels[i];
    assert(fs.existsSync(path.join(root, rel)), rel);
  }
};
