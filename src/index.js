const uniq = require("lodash.uniq");
const parser = require("./util/parser");

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

const matches = (wildcard, input, arr, ctx) => (Array.isArray(wildcard)
  ? wildcard.some(wc => matches(wc, input, arr, ctx))
  : (wildcard === (arr ? "[*]" : "*") || compare(wildcard, input, arr, ctx)));

const formatPath = (input, ctx) => (ctx.joined ? input.reduce((p, c) => {
  const isNumber = typeof c === "number";
  // eslint-disable-next-line no-nested-ternary
  return `${p}${p === "" || isNumber ? "" : "."}${isNumber ? `[${c}]` : (ctx.escapePaths ? escape(c) : c)}`;
}, "") : input);

const slice = array => Object
  .defineProperty(array.slice(1), "needle", { value: array.needle, writable: false });

const find = (haystack, checks, pathIn, parents, ctx) => {
  const result = [];
  const match = checks.find(check => check.length === 0);
  if (match !== undefined) {
    if (
      ctx.excludeFn === undefined
      || ctx.excludeFn(formatPath(pathIn, ctx), haystack, { parents, needle: match.needle }) !== true
    ) {
      if (ctx.callbackFn !== undefined) {
        ctx.callbackFn(formatPath(pathIn, ctx), haystack, { parents, needle: match.needle });
      }
      result.push(formatPath(pathIn, ctx));
    }
  }
  if (ctx.breakFn === undefined || ctx.breakFn(formatPath(pathIn, ctx), haystack, {
    parents,
    needle: checks.reduce((p, c) => (p.length > c.length ? c : p), checks[0]).needle
  }) !== true) {
    if (haystack instanceof Object) {
      if (Array.isArray(haystack)) {
        for (let i = 0; i < haystack.length; i += 1) {
          const pathOut = pathIn.concat(i);
          checks
            .filter(check => check.length !== 0)
            .forEach((check) => {
              if (ctx.useArraySelector === false) {
                result.push(...find(haystack[i], [check], pathOut, parents, ctx));
              } else if (check[0] === "**") {
                result.push(...find(haystack[i], [check, slice(check)], pathOut, parents.concat([haystack]), ctx));
              } else if (matches(check[0], `[${i}]`, true, ctx)) {
                result.push(...find(haystack[i], [slice(check)], pathOut, parents.concat([haystack]), ctx));
              }
            });
        }
      } else {
        Object.entries(haystack).forEach(([key, value]) => {
          const escapedKey = escape(key);
          const pathOut = pathIn.concat(key);
          checks
            .filter(check => check.length !== 0)
            .forEach((check) => {
              if (check[0] === "**") {
                result.push(...find(value, [check, slice(check)], pathOut, parents.concat([haystack]), ctx));
              } else if (matches(check[0], escapedKey, false, ctx)) {
                result.push(...find(value, [slice(check)], pathOut, parents.concat([haystack]), ctx));
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
  const search = uniq(needles).map(needle => Object
    .defineProperty(parser(needle), "needle", { value: needle, writable: false }));
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
