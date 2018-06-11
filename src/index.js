const parser = require("./util/parser");

module.exports = (needles, valueFn = undefined) => {
  const search = needles.map(parser);

  const find = (haystack, checks, pathIn = undefined) => {
    const result = [];
    if (checks.some(check => check.length === 0)) {
      if (valueFn === undefined || valueFn(haystack)) {
        result.push(pathIn);
      }
    }
    if (haystack instanceof Object) {
      if (Array.isArray(haystack)) {
        for (let i = 0; i < haystack.length; i += 1) {
          checks
            .filter(check => check.length !== 0)
            .forEach((check) => {
              const pathOut = `${pathIn === undefined ? "" : pathIn}[${i}]`;
              if (
                check[0] === "[*]" ||
                check[0] === `[${i}]` ||
                (check[0] instanceof Array && check[0].indexOf(`[${i}]`) !== -1)
              ) {
                result.push(...find(haystack[i], [check.slice(1)], pathOut));
              } else if (check[0] === "**") {
                result.push(...find(haystack[i], [check, check.slice(1)], pathOut));
              }
            });
        }
      } else {
        Object.keys(haystack).forEach((key) => {
          checks
            .filter(check => check.length !== 0)
            .forEach((check) => {
              const escapedKey = key.replace(/[,.*[\]{}]/g, "\\$&");
              const pathOut = pathIn === undefined ? key : `${pathIn}.${key}`;
              if (
                check[0] === "*" ||
                check[0] === escapedKey ||
                (check[0] instanceof Array && check[0].indexOf(escapedKey) !== -1)
              ) {
                result.push(...find(haystack[key], [check.slice(1)], pathOut));
              } else if (check[0] === "**") {
                result.push(...find(haystack[key], [check, check.slice(1)], pathOut));
              }
            });
        });
      }
    }
    return result;
  };

  return haystack => find(haystack, search);
};
