const specialChars = /[?!,.*+[\](){}\\]/g;
export const escape = (input) => input.replace(specialChars, '\\$&');

const regexEscapeChars = /[-/\\^$*+?.()|[\]{}]/g;
export const escapeRegex = (char) => char.replace(regexEscapeChars, '\\$&');

export const asRegex = (regexStr) => {
  try {
    return new RegExp(regexStr);
  } catch (e) {
    throw new Error(`Invalid Regex: "${regexStr}"`);
  }
};

export const toPath = (input) => input
  .reduce((p, c) => `${p}${typeof c === 'number' ? `[${c}]` : `${p ? '.' : ''}${escape(c)}`}`, '');
