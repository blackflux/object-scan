const assert = require('assert');
const compiler = require('./util/compiler');

const escape = input => String(input).replace(/[!,.*[\]{}]/g, '\\$&');

const isWildcardMatch = (wildcard, key, isArray, subSearch) => {
  if (wildcard === (isArray ? '[*]' : '*')) {
    return true;
  }
  if (isArray && !wildcard.match(/^\[.*]$/)) {
    return false;
  }
  return (isArray ? `[${key}]` : escape(key)).match(compiler.getWildcardRegex(subSearch));
};

const formatPath = (input, ctx) => (ctx.joined ? input.reduce(
  (p, c) => `${p}${typeof c === 'number' ? `[${c}]` : `${p ? '.' : ''}${ctx.escapePaths ? escape(c) : c}`}`,
  ''
) : input);

const findLast = (array, fn) => {
  for (let idx = array.length - 1; idx >= 0; idx -= 1) {
    const item = array[idx];
    if (fn(item)) {
      return item;
    }
  }
  return undefined;
};

const find = (haystack, searches, pathIn, parents, ctx) => {
  const recurseHaystack = ctx.breakFn === undefined
    || ctx.breakFn(formatPath(pathIn, ctx), haystack, compiler.getMeta(searches, parents)) !== true;

  const result = [];
  if (ctx.useArraySelector === false && Array.isArray(haystack)) {
    if (recurseHaystack) {
      for (let i = 0; i < haystack.length; i += 1) {
        result.push(...find(haystack[i], searches, pathIn.concat(i), parents, ctx));
      }
    }
    return result;
  }
  if (parents.length === 0 && searches[0][''] !== undefined) {
    assert(searches.length === 1);
    result.push(...find(haystack, [searches[0]['']], pathIn, parents, ctx));
  }

  if (recurseHaystack && haystack instanceof Object) {
    const isArray = Array.isArray(haystack);
    const parentsOut = [haystack].concat(parents);
    Object.entries(haystack).reverse().forEach(([key, value]) => {
      const pathOut = pathIn.concat(isArray ? parseInt(key, 10) : key);
      const searchesOut = searches.reduce((p, s) => {
        Object.entries(s).forEach(([entry, subSearch]) => {
          if (entry === '**') {
            p.push(compiler.getStarRecursion(subSearch));
            p.push(subSearch);
          } else if (isWildcardMatch(entry, key, isArray, subSearch)) {
            p.push(subSearch);
          }
        });
        return p;
      }, []);
      if (searchesOut.some(s => compiler.isIncluded(s))) {
        result.push(...find(value, searchesOut, pathOut, parentsOut, ctx));
      }
    });
  }

  if (compiler.isIncluded(findLast(searches, s => compiler.isMatch(s)))) {
    if (
      ctx.filterFn === undefined
      || ctx.filterFn(formatPath(pathIn, ctx), haystack, compiler.getMeta(searches, parents)) !== false
    ) {
      result.push(formatPath(pathIn, ctx));
    }
  }

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
    escapePaths: true,
    useArraySelector: true
  }, opts);
  assert(Object.keys(ctx).length === 5, 'Unexpected Option provided!');
  assert(['function', 'undefined'].includes(typeof ctx.filterFn));
  assert(['function', 'undefined'].includes(typeof ctx.breakFn));
  assert(typeof ctx.joined === 'boolean');
  assert(typeof ctx.escapePaths === 'boolean');
  assert(typeof ctx.useArraySelector === 'boolean');

  const search = compiler.compile(needles); // keep separate for performance
  return haystack => find(haystack, [search], [], [], ctx);
};
