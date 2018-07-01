const guid = require("./guid");

module.exports = (input) => {
  const tmpSep = guid();
  return input
    // split at "." and before "[", but only if not escaped
    .replace(/(?<!\\|^)((?:\\{2})*)(?:\.|(?=\[))(?!\[?$)/g, (_, esc) => `${esc}${tmpSep}`)
    .split(tmpSep)
    // handle or groups
    .map((e) => {
      const orMatches = [];
      // handle basic or-groups
      e.replace(/^{(.+)}$/g, (complete, m) => orMatches.push(...m
        // split at ",", but only if not escaped
        .replace(/(?<!\\|^)((?:\\{2})*)(?:,)(?!$)/g, (_, esc) => `${esc}${tmpSep}`)
        .split(tmpSep)));
      // handle list or-groups (only numbers)
      e.replace(/^\[{(\d+(?:,\d+)*)}]$/g, (complete, m) => orMatches.push(...m.split(",").map(idx => `[${idx}]`)));
      return orMatches.length === 0 ? e : orMatches;
    });
};
