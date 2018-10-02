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
  if (compiler.isFinal(search)) {
    if (
      ctx.excludeFn === undefined
      || ctx.excludeFn(formatPath(pathIn, ctx), haystack, { parents, needles: compiler.getNeedles(search) }) !== true
    ) {
      if (ctx.callbackFn !== undefined) {
        ctx.callbackFn(formatPath(pathIn, ctx), haystack, { parents, needles: compiler.getNeedles(search) });
      }
      result.push(formatPath(pathIn, ctx));
    }
  }
  if (
    ctx.breakFn === undefined
    || ctx.breakFn(formatPath(pathIn, ctx), haystack, { parents, needles: compiler.getNeedles(search) }) !== true
  ) {
    if (haystack instanceof Object) {
      if (Array.isArray(haystack)) {
        for (let i = 0; i < haystack.length; i += 1) {
          const pathOut = pathIn.concat(i);
          Object.entries(search)
            .forEach(([entry, subSearch]) => {
              if (ctx.useArraySelector === false) {
                result.push(...find(haystack[i], search, pathOut, parents, ctx));
              } else if (entry === "**") {
                [subSearch, search].forEach(s => result
                  .push(...find(haystack[i], s, pathOut, parents.concat([haystack]), ctx)));
              } else if (matches(entry, `[${i}]`, true, ctx)) {
                result.push(...find(haystack[i], subSearch, pathOut, parents.concat([haystack]), ctx));
              }
            });
        }
      } else {
        Object.entries(haystack).forEach(([key, value]) => {
          const escapedKey = escape(key);
          const pathOut = pathIn.concat(key);
          Object.entries(search)
            .forEach(([entry, subSearch]) => {
              if (entry === "**") {
                [subSearch, search].forEach(s => result
                  .push(...find(value, s, pathOut, parents.concat([haystack]), ctx)));
              } else if (matches(entry, escapedKey, false, ctx)) {
                result.push(...find(value, subSearch, pathOut, parents.concat([haystack]), ctx));
              }
            });
        });
      }
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
