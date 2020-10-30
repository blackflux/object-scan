const { escapeRegex, asRegex } = require('../generic/helper');

const parseWildcard = (str) => {
  let regex = '';
  let escaped = false;
  for (let idx = 0; idx < str.length; idx += 1) {
    const char = str[idx];
    if (!escaped && char === '\\') {
      escaped = true;
    } else if (!escaped && char === '*') {
      regex += '.*';
    } else if (!escaped && char === '+') {
      regex += '.+';
    } else if (!escaped && char === '?') {
      regex += '.';
    } else {
      regex += escapeRegex(char);
      escaped = false;
    }
  }
  return new RegExp(`^${regex}$`);
};
module.exports.parseWildcard = parseWildcard;

const compileWildcard = (str) => {
  if (['**', '++'].includes(str)) {
    return asRegex('.*');
  }
  if ((str.startsWith('**(') || str.startsWith('++(')) && str.endsWith(')')) {
    return asRegex(str.slice(3, -1));
  }
  if (str.startsWith('[(') && str.endsWith(')]')) {
    return asRegex(str.slice(2, -2));
  }
  if (str.startsWith('(') && str.endsWith(')')) {
    return asRegex(str.slice(1, -1));
  }
  if (str.startsWith('[') && str.endsWith(']')) {
    return parseWildcard(str.slice(1, -1));
  }
  return parseWildcard(str);
};

class Wildcard extends String {
  constructor(value, excluded) {
    super(value);
    this.excluded = excluded;
    this.regex = compileWildcard(value);
    this.isArrayTarget = value.startsWith('[') && value.endsWith(']');
    this.isStarRec = value === '**' || (value.startsWith('**(') && value.endsWith(')'));
    this.isPlusRec = value === '++' || (value.startsWith('++(') && value.endsWith(')'));
    this.isRecursive = this.isStarRec || this.isPlusRec;
  }

  anyMatch(key) {
    return this.regex.test(key);
  }

  typeMatch(key, isArray) {
    if (
      isArray !== this.isArrayTarget
      && !this.isRecursive
    ) {
      return false;
    }
    return this.anyMatch(key);
  }
}

module.exports.Wildcard = Wildcard;
