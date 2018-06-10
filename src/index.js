module.exports = (needles) => {
  const compiledSearch = needles.map(n => new RegExp(`^${n
    // escape input for regex
    .replace(/[-[\]/()+?.\\^$|]/g, "\\$&")
    // prepare input for matching
    .replace(/(?<=^|\.)\*\*(?=$|\\\.|\\\[)/g, ".+?")
    .replace(/(?<=^|\.|\[)\*(?=$|\\\.|\\\[|\\])/g, "[^.]+?")
    .replace(/(?<=^|\.|\[){([^}]+?)}(?=$|\\\.|\\\[|\\])/g, (_, match) => `(${match
      .replace(/(?<!\\)(\\*),/g, (all, g1) => ((g1.length / 2) % 2 === 1 ? all : `${g1}|`))})`)
    // unescape unmatched
    .replace(/\\([,*{}])/g, "$1")}$`));

  const find = (haystack, valueFn, selector = undefined) => {
    const result = [];
    if (selector !== undefined && compiledSearch.some(search => selector.match(search))) {
      if (valueFn === undefined || valueFn(haystack)) {
        result.push(selector);
      }
    }
    if (haystack instanceof Object) {
      if (Array.isArray(haystack)) {
        for (let i = 0; i < haystack.length; i += 1) {
          result.push(...find(haystack[i], valueFn, `${selector === undefined ? "" : selector}[${i}]`));
        }
      } else {
        Object.keys(haystack).forEach((key) => {
          result.push(...find(haystack[key], valueFn, selector === undefined ? key : `${selector}.${key}`));
        });
      }
    }
    return result;
  };

  return (haystack, valueFn) => find(haystack, valueFn);
};
