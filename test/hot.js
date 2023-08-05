import assert from 'assert';
import crypto from 'crypto';
import fs from 'fs';
import { URL } from 'url';

const lookup = {};
let envVars = {};
const port = {}; // dummy variable, not used

/* serialized and passed into main process */
function createListener() {
  /* communicate process.env to loader process */
  process.env = new Proxy(process.env, {
    set(target, key, value) {
      // eslint-disable-next-line no-param-reassign
      target[key] = value;
      port.postMessage(target);
      return target[key];
    },
    deleteProperty(target, key) {
      if (!(key in target)) {
        return true;
      }
      // eslint-disable-next-line no-param-reassign
      delete target[key];
      port.postMessage(target);
      return true;
    }
  });
}

export function globalPreload({ port: p }) {
  if (process.versions.node.split('.')[0] < 20) {
    /* Skip listener, since process shared before node 20 */
    envVars = process.env;
    return '(() => {})()';
  }
  // eslint-disable-next-line no-param-reassign
  p.onmessage = ({ data }) => {
    envVars = data;
  };
  return `(${createListener})()`;
}

export const resolve = async (specifier, context, defaultResolve) => {
  const result = await defaultResolve(specifier, context, defaultResolve);
  const child = new URL(result.url);

  if (
    child.protocol === 'nodejs:'
    || child.protocol === 'node:'
    || child.pathname.includes('/node_modules/')
    || context.parentURL === undefined
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
      if (content.includes('/* load-hot */')) {
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

  if (!('TEST_SEED' in envVars)) {
    return result;
  }

  if (lookup[childPath].reload === false) {
    return result;
  }

  if (Array.isArray(lookup[childPath].reload)) {
    const hash = lookup[childPath].reload.reduce(
      (p, c) => p.update(c).update(envVars[c] || '<undefined>'),
      crypto.createHash('md5')
    ).digest('hex');
    return {
      url: `${child.href}?id=${hash}`
    };
  }

  return {
    url: `${child.href}?id=${envVars.TEST_SEED}`
  };
};
