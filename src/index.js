const compiler = require("./util/compiler");

const escape = input => String(input).replace(/[,.*[\]{}]/g, "\\$&");

const matches = (wildcard, key, isArray, subSearch) => {
  if (wildcard === (isArray ? "[*]" : "*")) {
    return true;
  }
  if (isArray && !wildcard.match(/^\[.*]$/)) {
    return false;
  }
  return (isArray ? `[${key}]` : escape(key)).match(compiler.getWildcardRegex(subSearch));
};

const formatPath = (input, ctx) => (ctx.joined ? input.reduce((p, c) => {
  const isNumber = typeof c === "number";
  // eslint-disable-next-line no-nested-ternary
  return `${p}${isNumber || p === "" ? "" : "."}${isNumber ? `[${c}]` : (ctx.escapePaths ? escape(c) : c)}`;
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
      const parentsOut = parents.concat([haystack]);
      Object.entries(haystack).forEach(([key, value]) => {
        const pathOut = pathIn.concat(isArray ? parseInt(key, 10) : key);
        Object.entries(search)
          .forEach(([entry, subSearch]) => {
            if (entry === "**") {
              [subSearch, search].forEach(s => result.push(...find(value, s, pathOut, parentsOut, ctx)));
            } else if (matches(entry, key, isArray, subSearch)) {
              result.push(...find(value, subSearch, pathOut, parentsOut, ctx));
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
  const search = compiler.compile(new Set(needles)); // keep separate for performance
  return haystack => [...new Set(find(haystack, search, [], [], {
    excludeFn,
    breakFn,
    callbackFn,
    joined,
    escapePaths,
    useArraySelector
  }))];
};
