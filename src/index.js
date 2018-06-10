module.exports = (needles) => {
  const compiledSearch = needles.map(n => new RegExp(`^${n
    .replace(/\[/g, "\\[")
    .replace(/]/g, "\\]")
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, ".+?")
    .replace(/\*/g, "[^.]+?")}$`));

  const find = (haystack, selector = undefined) => {
    const result = [];
    if (selector !== undefined && compiledSearch.some(search => selector.match(search))) {
      result.push(selector);
    }
    if (haystack instanceof Object) {
      if (Array.isArray(haystack)) {
        for (let i = 0; i < haystack.length; i += 1) {
          result.push(...find(haystack[i], `${selector === undefined ? "" : selector}[${i}]`));
        }
      } else {
        Object.keys(haystack).forEach((key) => {
          result.push(...find(haystack[key], selector === undefined ? key : `${selector}.${key}`));
        });
      }
    }
    return result;
  };

  return haystack => find(haystack);
};
