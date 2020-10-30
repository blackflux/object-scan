const compiler = require('./compiler');
const { escapeRegex, asRegex } = require('../generic/helper');

const parseWildcard = (input) => {
  let regex = '';
  let escaped = false;
  for (let idx = 0; idx < input.length; idx += 1) {
    const char = input[idx];
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

module.exports.compileRegex = (wildcard) => {
  const wildcardStr = String(wildcard);
  if (['**', '++'].includes(wildcardStr)) {
    return asRegex('.*');
  }
  if ((wildcardStr.startsWith('**(') || wildcardStr.startsWith('++(')) && wildcardStr.endsWith(')')) {
    return asRegex(wildcardStr.slice(3, -1));
  }
  if (wildcardStr.startsWith('[(') && wildcardStr.endsWith(')]')) {
    return asRegex(wildcardStr.slice(2, -2));
  }
  if (wildcardStr.startsWith('(') && wildcardStr.endsWith(')')) {
    return asRegex(wildcardStr.slice(1, -1));
  }
  if (wildcardStr.startsWith('[') && wildcardStr.endsWith(']')) {
    return parseWildcard(wildcardStr.slice(1, -1));
  }
  return parseWildcard(wildcardStr);
};

const isRegexMatch = (key, search) => compiler.getWildcardRegex(search).test(key);
module.exports.isRegexMatch = isRegexMatch;

const isMatch = (wildcard, key, isArray, search) => {
  if (['**', '++'].includes(wildcard)) {
    return true;
  }
  if (wildcard === (isArray ? '[*]' : '*')) {
    return true;
  }
  if (
    isArray !== compiler.isArrayTarget(search)
    && !compiler.isRecursive(search)
  ) {
    return false;
  }
  return isRegexMatch(key, search);
};
module.exports.isMatch = isMatch;
