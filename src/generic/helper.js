const specialChars = /[?!,.*+[\](){}\\]/g;
export const escape = (input) => input.replace(specialChars, '\\$&');

const regex = /^\^?[^-/\\^$*+?.()|[\]{}]*\$?$/g;
export const asRegex = (regexStr) => {
  if (regex.test(regexStr)) {
    const start = regexStr.startsWith('^');
    const end = regexStr.endsWith('$');
    if (start && end) {
      const value = regexStr.slice(1, -1);
      return { test: (v) => v === value };
    }
    if (start) {
      const value = regexStr.slice(1);
      return { test: (v) => v.startsWith(value) };
    }
    if (end) {
      const value = regexStr.slice(0, -1);
      return { test: (v) => v.endsWith(value) };
    }
    return { test: (v) => v.includes(regexStr) };
  }

  try {
    return new RegExp(regexStr);
  } catch (e) {
    throw new Error(`Invalid Regex: "${regexStr}"`);
  }
};

export const toPath = (input) => input
  .reduce((p, c) => `${p}${typeof c === 'number' ? `[${c}]` : `${p ? '.' : ''}${escape(c)}`}`, '');
