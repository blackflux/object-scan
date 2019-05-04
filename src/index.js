const assert = require('assert');
const compiler = require('./util/compiler');
const { findLast } = require('./util/helper');

const specialChars = /[?!,.*[\]{}]/g;
const escape = input => input.replace(specialChars, '\\$&');

const isWildcardMatch = (wildcard, key, isArray, subSearch) => {
  if (wildcard === '**') {
    return true;
  }
  if (wildcard === (isArray ? '[*]' : '*')) {
    return true;
  }
  if (isArray && !wildcard.match(/^\[.*]$/)) {
    return false;
  }
  return (isArray ? `[${key}]` : escape(key)).match(compiler.getWildcardRegex(subSearch));
};

const formatPath = (input, ctx) => (ctx.joined ? input.reduce(
  (p, c) => `${p}${typeof c === 'number' ? `[${c}]` : `${p ? '.' : ''}${escape(c)}`}`,
  ''
) : [...input]);

const find = (haystack_, searches_, ctx) => {
  const result = [];

  const stack = [false, searches_, null, 0];
  const path = [];
  const parents = [];

  let haystack = haystack_;
  do {
    const depth = stack.pop();
    const segment = stack.pop();
    const searches = stack.pop();
    const isResult = stack.pop();

    const diff = path.length - depth;
    for (let idx = 0; idx < diff; idx += 1) {
      parents.pop();
      path.pop();
    }
    if (diff === -1) {
      parents.push(haystack);
      path.push(segment);
      haystack = haystack[segment];
    } else if (segment !== null) {
      path[path.length - 1] = segment;
      haystack = parents[parents.length - 1][segment];
    } else {
      haystack = haystack_;
    }

    if (isResult) {
      if (
        ctx.filterFn === undefined
        || ctx.filterFn(formatPath(path, ctx), haystack, compiler.getMeta(searches, parents)) !== false
      ) {
        result.push(formatPath(path, ctx));
      }
      // eslint-disable-next-line no-continue
      continue;
    }

    if (!searches.some(s => compiler.hasMatches(s))) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const recurseHaystack = ctx.breakFn === undefined
      || ctx.breakFn(formatPath(path, ctx), haystack, compiler.getMeta(searches, parents)) !== true;

    if (ctx.useArraySelector === false && Array.isArray(haystack)) {
      if (recurseHaystack) {
        for (let i = 0; i < haystack.length; i += 1) {
          stack.push(false, searches, i, depth + 1);
        }
      }
      // eslint-disable-next-line no-continue
      continue;
    }

    if (compiler.isMatch(findLast(searches, s => compiler.isLeaf(s)))) {
      stack.push(true, searches, segment, depth);
    }

    if (searches[0][''] !== undefined && path.find(p => typeof p === 'string') === undefined) {
      assert(searches.length === 1);
      stack.push(false, [searches[0]['']], segment, depth);
    }

    if (recurseHaystack && haystack instanceof Object) {
      const isArray = Array.isArray(haystack);
      Object.keys(haystack).forEach((key) => {
        const nextSegment = isArray ? parseInt(key, 10) : key;
        const searchesOut = searches.reduce((p, s) => {
          const recursionPos = compiler.isRecursive(s) ? compiler.getRecursionPos(s) : null;
          if (recursionPos === 0) {
            p.push(s);
          }
          compiler.getEntries(s).forEach(([entry, subSearch], idx) => {
            if (isWildcardMatch(entry, key, isArray, subSearch)) {
              p.push(subSearch);
            }
            if (idx + 1 === recursionPos) {
              p.push(s);
            }
          });
          return p;
        }, []);
        stack.push(false, searchesOut, nextSegment, depth + 1);
      });
    }
  } while (stack.length !== 0);

  return result;
};

module.exports = (needles, opts = {}) => {
  assert(Array.isArray(needles));
  assert(opts instanceof Object && !Array.isArray(opts));
  if (needles.length === 0) {
    return () => [];
  }

  const ctx = Object.assign({
    filterFn: undefined,
    breakFn: undefined,
    joined: true,
    useArraySelector: true,
    strict: true
  }, opts);
  assert(Object.keys(ctx).length === 5, 'Unexpected Option provided!');
  assert(['function', 'undefined'].includes(typeof ctx.filterFn));
  assert(['function', 'undefined'].includes(typeof ctx.breakFn));
  assert(typeof ctx.joined === 'boolean');
  assert(typeof ctx.useArraySelector === 'boolean');
  assert(typeof ctx.strict === 'boolean');

  const search = compiler.compile(needles, ctx.strict); // keep separate for performance
  return haystack => find(haystack, [search], ctx);
};
