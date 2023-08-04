import assert from 'assert';
import path from 'path';
import fs from 'smart-fs';

const root = path.join(fs.dirname(import.meta.url), '..', '..', '..');

export default async (rels, content) => {
  for (let i = 0; i < rels.length; i += 1) {
    const rel = rels[i];
    assert(fs.existsSync(path.join(root, rel)), rel);
  }
};
