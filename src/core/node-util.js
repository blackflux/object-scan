import { asRegex } from '../generic/helper.js';

const charsToEscape = ['-', '/', '\\', '^', '$', '*', '+', '?', '.', '(', ')', '|', '[', ']', '{', '}'];
export const parseValue = (value) => {
  let regex = '';
  let escaped = false;
  let simple = true;
  // Track literal segments for common single-wildcard patterns:
  //   `prefix*` -> startsWith, `*suffix` -> endsWith, `*infix*` -> includes
  let firstSeg = '';
  let segCount = 0;
  let startsWithWildcard = false;
  let endsWithWildcard = false;
  let currentSeg = '';
  let sawWildcard = false;
  let onlyStarWildcards = true;
  for (let idx = 0; idx < value.length; idx += 1) {
    const char = value[idx];
    if (!escaped && char === '\\') {
      escaped = true;
    } else if (!escaped && char === '*') {
      simple = false;
      regex += '.*';
      if (currentSeg !== '') {
        if (segCount === 0) {
          firstSeg = currentSeg;
        }
        segCount += 1;
        currentSeg = '';
      }
      if (!sawWildcard) {
        startsWithWildcard = idx === 0;
        sawWildcard = true;
      }
      endsWithWildcard = true;
    } else if (!escaped && char === '+') {
      simple = false;
      regex += '.+';
      onlyStarWildcards = false;
      if (currentSeg !== '') {
        if (segCount === 0) {
          firstSeg = currentSeg;
        }
        segCount += 1;
        currentSeg = '';
      }
      if (!sawWildcard) {
        startsWithWildcard = idx === 0;
        sawWildcard = true;
      }
      endsWithWildcard = true;
    } else if (!escaped && char === '?') {
      simple = false;
      regex += '.';
      onlyStarWildcards = false;
      if (currentSeg !== '') {
        if (segCount === 0) {
          firstSeg = currentSeg;
        }
        segCount += 1;
        currentSeg = '';
      }
      if (!sawWildcard) {
        startsWithWildcard = idx === 0;
        sawWildcard = true;
      }
      endsWithWildcard = true;
    } else {
      if (charsToEscape.includes(char)) {
        simple = false;
        regex += '\\';
      }
      regex += char;
      escaped = false;
      currentSeg += char;
      endsWithWildcard = false;
    }
  }
  if (currentSeg !== '') {
    if (segCount === 0) {
      firstSeg = currentSeg;
    }
    segCount += 1;
  }
  if (simple) {
    return { test: (v) => String(v) === regex };
  }
  if (regex === '.+') {
    return { test: (v) => v !== '' };
  }
  if (segCount === 1 && firstSeg !== '' && onlyStarWildcards) {
    const lit = firstSeg;
    if (startsWithWildcard && endsWithWildcard) {
      return { test: (v) => (typeof v === 'string' ? v.includes(lit) : String(v).includes(lit)) };
    }
    if (startsWithWildcard) {
      return { test: (v) => (typeof v === 'string' ? v.endsWith(lit) : String(v).endsWith(lit)) };
    }
    if (endsWithWildcard) {
      return { test: (v) => (typeof v === 'string' ? v.startsWith(lit) : String(v).startsWith(lit)) };
    }
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
