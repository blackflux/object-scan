module.exports.defineProperty = (target, k, v, readonly = true) => Object
  .defineProperty(target, k, { value: v, writable: !readonly });

const specialChars = /[?!,.*[\]{}\\]/g;
const escape = (input) => input.replace(specialChars, '\\$&');
module.exports.escape = escape;

module.exports.parseWildcard = (input) => {
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
      regex += char.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      escaped = false;
    }
  }
  return new RegExp(`^${regex}$`);
};

module.exports.toPath = (input) => input
  .reduce((p, c) => `${p}${typeof c === 'number' ? `[${c}]` : `${p ? '.' : ''}${escape(c)}`}`, '');
