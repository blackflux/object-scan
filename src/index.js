const assert = require('assert');
const compiler = require('./util/compiler');
const { findLast } = require('./util/helper');

const escape = input => String(input).replace(/[?!,.*[\]{}]/g, '\\$&');

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
) : input);

const find = (haystack, searches, pathIn, parents, ctx) => {
  if (!searches.some(s => compiler.hasMatches(s))) {
    return [];
  }

  const recurseHaystack = ctx.breakFn === undefined
    || ctx.breakFn(formatPath(pathIn, ctx), haystack, compiler.getMeta(searches, parents)) !== true;

  const result = [];
  if (ctx.useArraySelector === false && Array.isArray(haystack)) {
    if (recurseHaystack) {
      for (let i = haystack.length - 1; i >= 0; i -= 1) {
        result.push(...find(haystack[i], searches, pathIn.concat(i), parents, ctx));
      }
    }
    return result;
  }

  if (recurseHaystack && haystack instanceof Object) {
    const isArray = Array.isArray(haystack);
    const parentsOut = [haystack].concat(parents);
    Object.entries(haystack).reverse().forEach(([key, value]) => {
      const pathOut = pathIn.concat(isArray ? parseInt(key, 10) : key);
      const searchesOut = searches.reduce((p, s) => {
        const recursionPos = compiler.isRecursive(s) ? compiler.getRecursionPos(s) : null;
        if (recursionPos === 0) {
          p.push(s);
        }
        Object.entries(s).forEach(([entry, subSearch], idx) => {
          if (isWildcardMatch(entry, key, isArray, subSearch)) {
            p.push(subSearch);
          }
          if (idx + 1 === recursionPos) {
            p.push(s);
          }
        });
        return p;
      }, []);
      result.push(...find(value, searchesOut, pathOut, parentsOut, ctx));
    });
  }

  if (parents.length === 0 && searches[0][''] !== undefined) {
    assert(searches.length === 1);
    result.push(...find(haystack, [searches[0]['']], pathIn, parents, ctx));
  }

  if (compiler.isMatch(findLast(searches, s => compiler.isLeaf(s)))) {
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
  return haystack => find(haystack, [search], [], [], ctx);
};
