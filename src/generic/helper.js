export const defineProperty = (target, k, v, readonly = true) => Object
  .defineProperty(target, k, { value: v, writable: !readonly });

const specialChars = /[?!,.*+[\](){}\\]/g;
export const escape = (input) => input.replace(specialChars, '\\$&');

export const escapeRegex = (char) => char.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

export const asRegex = (regexStr) => {
  try {
    return new RegExp(regexStr);
  } catch (e) {
    throw new Error(`Invalid Regex: "${regexStr}"`);
  }
};

export const toPath = (input) => input
  .reduce((p, c) => `${p}${typeof c === 'number' ? `[${c}]` : `${p ? '.' : ''}${escape(c)}`}`, '');
