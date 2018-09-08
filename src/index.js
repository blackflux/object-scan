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

const find = (haystack, checks, pathIn, ctx) => {
  const result = [];
  if (checks.some(check => check.length === 0)) {
    if (ctx.filterFn === undefined || ctx.filterFn(pathIn.map(escape).join("."), haystack)) {
      result.push(ctx.joined ? pathIn.reduce((p, c) => {
        const isNumber = typeof c === "number";
        return `${p}${p === "" || isNumber ? "" : "."}${isNumber ? `[${c}]` : c}`;
      }, "") : pathIn);
    }
  }
  if (ctx.breakFn === undefined || !ctx.breakFn(pathIn.map(escape).join("."), haystack)) {
    if (typeof haystack === "object") {
      if (Array.isArray(haystack)) {
        for (let i = 0; i < haystack.length; i += 1) {
          const pathOut = pathIn.concat(i);
          checks
            .filter(check => check.length !== 0)
            .forEach((check) => {
              if (check[0] === "**") {
                result.push(...find(haystack[i], [check, check.slice(1)], pathOut, ctx));
              } else if (matches(check[0], `[${i}]`, true, ctx)) {
                result.push(...find(haystack[i], [check.slice(1)], pathOut, ctx));
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
                result.push(...find(value, [check, check.slice(1)], pathOut, ctx));
              } else if (matches(check[0], escapedKey, false, ctx)) {
                result.push(...find(value, [check.slice(1)], pathOut, ctx));
              }
            });
        });
      }
    }
  }
  return result;
};

module.exports = (needles, {
  filterFn = undefined,
  breakFn = undefined,
  joined = true
} = {}) => {
  const search = uniq(needles).map(parser);
  const regexCache = {};

  return haystack => uniq(find(haystack, search, [], {
    filterFn, breakFn, joined, regexCache
  }));
};
