const parser = require("./util/parser");

const escape = input => String(input).replace(/[,.*[\]{}]/g, "\\$&");

module.exports = (needles, {
  filterFn = undefined,
  breakFn = undefined,
  joined = true
} = {}) => {
  const search = needles.map(parser);
  const regexCache = {};

  const compare = (wildcard, input, arr) => {
    if (arr && !wildcard.match(/^\[.*]$/)) {
      return false;
    }
    if (regexCache[wildcard] === undefined) {
      regexCache[wildcard] = new RegExp(`^${wildcard
        .split(/(?<!\\)(?:\\\\)*\*/)
        .map(p => p.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'))
        .join(".*")}$`);
    }
    return input.match(regexCache[wildcard]);
  };

  const matches = (wildcard, input, arr) => (Array.isArray(wildcard)
    ? wildcard.some(wc => matches(wc, input, arr))
    : (wildcard === (arr ? "[*]" : "*") || compare(wildcard, input, arr)));

  const find = (haystack, checks, pathIn = []) => {
    const result = [];
    if (checks.some(check => check.length === 0)) {
      if (filterFn === undefined || filterFn(pathIn.map(escape).join("."), haystack)) {
        result.push(joined ? pathIn.reduce((p, c) => {
          const isNumber = typeof c === "number";
          return `${p}${p === "" || isNumber ? "" : "."}${isNumber ? `[${c}]` : c}`;
        }, "") : pathIn);
      }
    }
    if (breakFn === undefined || !breakFn(pathIn.map(escape).join("."), haystack)) {
      if (typeof haystack === "object") {
        if (Array.isArray(haystack)) {
          for (let i = 0; i < haystack.length; i += 1) {
            const pathOut = pathIn.concat(i);
            checks
              .filter(check => check.length !== 0)
              .forEach((check) => {
                if (check[0] === "**") {
                  result.push(...find(haystack[i], [check, check.slice(1)], pathOut));
                } else if (matches(check[0], `[${i}]`, true)) {
                  result.push(...find(haystack[i], [check.slice(1)], pathOut));
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
                  result.push(...find(value, [check, check.slice(1)], pathOut));
                } else if (matches(check[0], escapedKey, false)) {
                  result.push(...find(value, [check.slice(1)], pathOut));
                }
              });
          });
        }
      }
    }
    return result;
  };

  return haystack => find(haystack, search);
};
