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
    this.value = value;
    this.excluded = excluded;
    this.regex = compileWildcard(value);
    this.isArrayTarget = value.startsWith('[') && value.endsWith(']');
    this.isSimpleStarRec = value === '**';
    this.isSimplePlusRec = value === '++';
    this.isSimpleRec = this.isSimpleStarRec || this.isSimplePlusRec;
    this.isStarRec = this.isSimpleStarRec || (value.startsWith('**(') && value.endsWith(')'));
    this.isPlusRec = this.isSimplePlusRec || (value.startsWith('++(') && value.endsWith(')'));
    this.isRec = this.isStarRec || this.isPlusRec;
    this.isAnyArrayTarget = value === '[*]';
    this.isAnyObjTarget = value === '*';
  }

  anyMatch(key) {
    return this.regex.test(key);
  }

  typeMatch(key, isArray) {
    if (this.isSimpleRec) {
      return true;
    }
    if (isArray && this.isAnyArrayTarget) {
      return true;
    }
    if (!isArray && this.isAnyObjTarget) {
      return true;
    }
    if (
      isArray !== this.isArrayTarget
      && !this.isRec
    ) {
      return false;
    }
    return this.anyMatch(key);
  }
}

module.exports.Wildcard = Wildcard;
