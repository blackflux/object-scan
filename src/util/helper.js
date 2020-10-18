module.exports.defineProperty = (target, k, v, readonly = true) => Object
  .defineProperty(target, k, { value: v, writable: !readonly });

const specialChars = /[?!,.*[\](){}\\]/g;
const escape = (input) => input.replace(specialChars, '\\$&');
module.exports.escape = escape;

const escapeRegex = (char) => char.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
module.exports.escapeRegex = escapeRegex;

const fullRegex = new RegExp([
  /^/.source,
  /(?=(?:\[.*]|\(.*\))$)/.source,
  /\[?\((.*)\)]?/.source,
  /$/.source
].join(''));

module.exports.parseWildcard = (input) => {
  const match = fullRegex.exec(input);
  if (match) {
    const regexStr = match[1];
    try {
      return new RegExp(regexStr);
    } catch (e) {
      throw new Error(`Invalid Regex: "${regexStr}"`);
    }
  }
  let regex = '';
  let escaped = false;
  for (let idx = 0; idx < input.length; idx += 1) {
    const char = input[idx];
    if (!escaped && char === '\\') {
      escaped = true;
    } else if (!escaped && char === '*') {
      regex += '.*';
    } else if (!escaped && char === '?') {
      regex += '.';
    } else {
      regex += escapeRegex(char);
      escaped = false;
    }
  }
  return new RegExp(`^${regex}$`);
};

module.exports.toPath = (input) => input
  .reduce((p, c) => `${p}${typeof c === 'number' ? `[${c}]` : `${p ? '.' : ''}${escape(c)}`}`, '');
