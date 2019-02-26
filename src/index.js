const assert = require('assert');
const compiler = require('./util/compiler');
const sortFn = require('./util/sort-fn');

const escape = input => String(input).replace(/[,.*[\]{}]/g, '\\$&');

const matches = (wildcard, key, isArray, subSearch) => {
  if (wildcard === (isArray ? '[*]' : '*')) {
    return true;
  }
  if (isArray && !wildcard.match(/^\[.*]$/)) {
    return false;
  }
  return (isArray ? `[${key}]` : escape(key)).match(compiler.getWildcardRegex(subSearch));
};

const formatPath = (input, ctx) => (ctx.joined ? input.reduce((p, c) => {
  const isNumber = typeof c === 'number';
  // eslint-disable-next-line no-nested-ternary
  return `${p}${isNumber || p === '' ? '' : '.'}${isNumber ? `[${c}]` : (ctx.escapePaths ? escape(c) : c)}`;
}, '') : input);

const find = (haystack, searches, pathIn, parents, ctx) => {
  const recurseHaystack = ctx.breakFn === undefined
    || ctx.breakFn(formatPath(pathIn, ctx), haystack, compiler.getMeta(searches, parents)) !== true;

  const result = [];
  if (ctx.useArraySelector === false && Array.isArray(haystack)) {
    if (ctx.arrayCallbackFn !== undefined) {
      if (searches.some(s => compiler.isMatch(s))) {
        ctx.arrayCallbackFn(formatPath(pathIn, ctx), haystack, compiler.getMeta(searches, parents));
      }
    }
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

  if (searches.some(s => compiler.isMatch(s))) {
    if (
      ctx.filterFn === undefined
      || ctx.filterFn(formatPath(pathIn, ctx), haystack, compiler.getMeta(searches, parents)) !== false
    ) {
      if (ctx.callbackFn !== undefined) {
        ctx.callbackFn(formatPath(pathIn, ctx), haystack, compiler.getMeta(searches, parents));
      }
      result.push(formatPath(pathIn, ctx));
    }
  }
  if (recurseHaystack && haystack instanceof Object) {
    const isArray = Array.isArray(haystack);
    const parentsOut = [haystack].concat(parents);
    Object.entries(haystack).forEach(([key, value]) => {
      const pathOut = pathIn.concat(isArray ? parseInt(key, 10) : key);
      result.push(...find(value, searches.reduce((p, s) => {
        Object.entries(s).forEach(([entry, subSearch]) => {
          if (entry === '**') {
            p.push(compiler.getStarRecursion(subSearch));
            p.push(subSearch);
          } else if (matches(entry, key, isArray, subSearch)) {
            p.push(subSearch);
          }
        });
        return p;
      }, []), pathOut, parentsOut, ctx));
    });
  }
  return result;
};

module.exports = (needles, {
  filterFn = undefined,
  breakFn = undefined,
  callbackFn = undefined,
  arrayCallbackFn = undefined,
  joined = true,
  sorted = false,
  escapePaths = true,
  useArraySelector = true
} = {}) => {
  assert(sorted === false || joined === false, 'Sorted can only be used with joined set to false');
  const search = compiler.compile(new Set(needles)); // keep separate for performance
  return (haystack) => {
    const result = find(haystack, [search], [], [], {
      filterFn,
      breakFn,
      callbackFn,
      arrayCallbackFn,
      joined,
      escapePaths,
      useArraySelector
    });
    return sorted === true ? result.sort(sortFn) : result;
  };
};
