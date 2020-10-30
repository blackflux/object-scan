module.exports.defineProperty = (target, k, v, readonly = true) => Object
  .defineProperty(target, k, { value: v, writable: !readonly });

const specialChars = /[?!,.*+[\](){}\\]/g;
const escape = (input) => input.replace(specialChars, '\\$&');
module.exports.escape = escape;

const escapeRegex = (char) => char.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
module.exports.escapeRegex = escapeRegex;

const asRegex = (regexStr) => {
  try {
    return new RegExp(regexStr);
  } catch (e) {
    throw new Error(`Invalid Regex: "${regexStr}"`);
  }
};
module.exports.asRegex = asRegex;

module.exports.toPath = (input) => input
  .reduce((p, c) => `${p}${typeof c === 'number' ? `[${c}]` : `${p ? '.' : ''}${escape(c)}`}`, '');
