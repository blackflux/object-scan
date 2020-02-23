module.exports.defineProperty = (target, k, v, readonly = true) => Object
  .defineProperty(target, k, { value: v, writable: !readonly });

module.exports.findLast = (array, fn) => {
  for (let idx = array.length - 1; idx >= 0; idx -= 1) {
    const item = array[idx];
    if (fn(item)) {
      return item;
    }
  }
  return undefined;
};

module.exports.reverseWhileCheck = (array, fnWhile, fnCheck) => {
  for (let idx = array.length - 1; idx >= 0; idx -= 1) {
    const item = array[idx];
    if (!fnWhile(item)) {
      break;
    }
    if (fnCheck(item)) {
      return true;
    }
  }
  return false;
};

const specialChars = /[?!,.*[\]{}]/g;
module.exports.escape = (input) => input.replace(specialChars, '\\$&');

module.exports.parseWildcard = (input) => {
  let regex = '';
  let escaped = false;
  for (let idx = 0; idx < input.length; idx += 1) {
    const char = input[idx];
    if (!escaped && char === '*') {
      regex += '.*';
    } else if (!escaped && char === '?') {
      regex += '.';
    } else if (['|', '\\', '{', '}', '(', ')', '[', ']', '^', '$', '+', '*', '?', '.'].includes(char)) {
      // escape all regex characters
      regex += `\\${char}`;
    } else {
      regex += char;
    }
    escaped = char === '\\' ? !escaped : false;
  }
  return new RegExp(`^${regex}$`);
};
