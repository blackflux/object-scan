import assert from 'assert';
import crypto from 'crypto';
import fs from 'fs';
import { URL } from 'url';

const lookup = {};

export const resolve = async (specifier, context, defaultResolve) => {
  const result = await defaultResolve(specifier, context, defaultResolve);
  const child = new URL(result.url);

  if (
    child.protocol === 'nodejs:'
    || child.protocol === 'node:'
    || child.pathname.includes('/node_modules/')
  ) {
    return result;
  }

  const parentPath = new URL(context.parentURL).pathname;
  const childPath = child.pathname;

  [childPath, parentPath].forEach((p) => {
    if (!(p in lookup)) {
      lookup[p] = {
        parents: [],
        reload: false
      };
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes('/* load-hot */') || content.includes('lru-cache-ext')) {
        lookup[p].reload = true;
      } else if (content.includes('process.env.')) {
        lookup[p].reload = [...content.matchAll(/\bprocess\.env\.([a-zA-Z0-9_]+)\b/g)].map((e) => e[1]);
      }
    }
  });
  const isNewParent = !lookup[childPath].parents.includes(parentPath);
  if (isNewParent) {
    lookup[childPath].parents.push(parentPath);
    // mark all parents as reload
    if (lookup[childPath].reload !== false) {
      const stack = [parentPath];
      while (stack.length !== 0) {
        const ancestor = lookup[stack.pop()];
        if (ancestor.reload !== true) {
          if (lookup[childPath].reload === true) {
            ancestor.reload = true;
          } else {
            assert(Array.isArray(lookup[childPath].reload));
            ancestor.reload = [
              ...(Array.isArray(ancestor.reload) ? ancestor.reload : []),
              ...lookup[childPath].reload
            ];
          }
        }
        stack.push(...ancestor.parents);
      }
    }
  }

  if (!('TEST_SEED' in process.env)) {
    return result;
  }

  if (lookup[childPath].reload === false) {
    return result;
  }

  if (Array.isArray(lookup[childPath].reload)) {
    const hash = lookup[childPath].reload.reduce(
      (p, c) => p.update(c).update(process.env[c] || '<undefined>'),
      crypto.createHash('md5')
    ).digest('hex');
    return {
      url: `${child.href}?id=${hash}`
    };
  }

  return {
    url: `${child.href}?id=${process.env.TEST_SEED}`
  };
};
