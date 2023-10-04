import { asRegex } from '../generic/helper.js';

const charsToEscape = ['-', '/', '\\', '^', '$', '*', '+', '?', '.', '(', ')', '|', '[', ']', '{', '}'];
export const parseValue = (value) => {
  let regex = '';
  let escaped = false;
  let simple = true;
  for (let idx = 0; idx < value.length; idx += 1) {
    const char = value[idx];
    if (!escaped && char === '\\') {
      escaped = true;
    } else if (!escaped && char === '*') {
      simple = false;
      regex += '.*';
    } else if (!escaped && char === '+') {
      simple = false;
      regex += '.+';
    } else if (!escaped && char === '?') {
      simple = false;
      regex += '.';
    } else {
      if (charsToEscape.includes(char)) {
        simple = false;
        regex += '\\';
      }
      regex += char;
      escaped = false;
    }
  }
  if (simple) {
    return { test: (v) => String(v) === regex };
  }
  if (regex === '.+') {
    return { test: (v) => v !== '' };
  }
  return new RegExp(`^${regex}$`);
};

export const compileValue = (value) => {
  if ((value.startsWith('**(') || value.startsWith('++(')) && value.endsWith(')')) {
    return asRegex(value.slice(3, -1));
  }
  if (value.startsWith('[(') && value.endsWith(')]')) {
    return asRegex(value.slice(2, -2));
  }
  if (value.startsWith('(') && value.endsWith(')')) {
    return asRegex(value.slice(1, -1));
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    return parseValue(value.slice(1, -1));
  }
  return parseValue(value);
};
