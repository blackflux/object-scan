const uniq = require("lodash.uniq");
const compiler = require("./util/compiler");

const escape = input => String(input).replace(/[,.*[\]{}]/g, "\\$&");

const compare = (wildcard, input, arr, ctx) => {
  if (arr && !wildcard.match(/^\[.*]$/)) {
    return false;
  }
  if (ctx.regexCache[wildcard] === undefined) {
    ctx.regexCache[wildcard] = new RegExp(`^${wildcard
      .split(/(?<!\\)(?:\\\\)*\*/)
      .map(p => p.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'))
      .join(".*")}$`);
  }
  return input.match(ctx.regexCache[wildcard]);
};

const matches = (wildcard, input, arr, ctx) => wildcard === (arr ? "[*]" : "*") || compare(wildcard, input, arr, ctx);

const formatPath = (input, ctx) => (ctx.joined ? input.reduce((p, c) => {
  const isNumber = typeof c === "number";
  // eslint-disable-next-line no-nested-ternary
  return `${p}${p === "" || isNumber ? "" : "."}${isNumber ? `[${c}]` : (ctx.escapePaths ? escape(c) : c)}`;
}, "") : input);

const find = (haystack, search, pathIn, parents, ctx) => {
  const result = [];
  if (ctx.useArraySelector === false && Array.isArray(haystack)) {
    for (let i = 0; i < haystack.length; i += 1) {
      result.push(...find(haystack[i], search, pathIn.concat(i), parents, ctx));
    }
    return result;
  }

  if (compiler.isMatch(search)) {
    if (
      ctx.excludeFn === undefined
      || ctx.excludeFn(formatPath(pathIn, ctx), haystack, Object.assign(compiler.getMeta(search), { parents })) !== true
    ) {
      if (ctx.callbackFn !== undefined) {
        ctx.callbackFn(formatPath(pathIn, ctx), haystack, Object.assign(compiler.getMeta(search), { parents }));
      }
      result.push(formatPath(pathIn, ctx));
    }
  }
  if (
    ctx.breakFn === undefined
    || ctx.breakFn(formatPath(pathIn, ctx), haystack, Object.assign(compiler.getMeta(search), { parents })) !== true
  ) {
    if (haystack instanceof Object) {
      const isArray = Array.isArray(haystack);
      Object.entries(haystack).forEach(([key, value]) => {
        const escapedKey = isArray ? `[${key}]` : escape(key);
        const pathOut = pathIn.concat(isArray ? parseInt(key, 10) : key);
        Object.entries(search)
          .forEach(([entry, subSearch]) => {
            if (entry === "**") {
              [subSearch, search]
                .forEach(s => result.push(...find(value, s, pathOut, parents.concat([haystack]), ctx)));
            } else if (matches(entry, escapedKey, isArray, ctx)) {
              result.push(...find(value, subSearch, pathOut, parents.concat([haystack]), ctx));
            }
          });
      });
    }
  }
  return result;
};

module.exports = (needles, {
  excludeFn = undefined,
  breakFn = undefined,
  callbackFn = undefined,
  joined = true,
  escapePaths = true,
  useArraySelector = true
} = {}) => {
  const search = compiler.compile(uniq(needles));
  const regexCache = {};

  return haystack => uniq(find(haystack, search, [], [], {
    excludeFn,
    breakFn,
    callbackFn,
    joined,
    regexCache,
    escapePaths,
    useArraySelector
  }));
};
