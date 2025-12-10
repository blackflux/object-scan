const specialChars = /[?!,.*+[\](){}\\]/g;
export const escape = (input) => input.replace(specialChars, '\\$&');

const regexMetaChars = /[\\^$*+?.()|[\]{}]/;
export const asRegex = (regexStr) => {
  const hasStart = regexStr.charCodeAt(0) === 94; // '^' is char code 94
  const hasEnd = regexStr.charCodeAt(regexStr.length - 1) === 36; // '$' is char code 36

  const content = regexStr.slice(
    hasStart ? 1 : 0,
    hasEnd ? -1 : undefined
  );

  if (regexMetaChars.test(content)) {
    try {
      return new RegExp(regexStr);
    } catch {
      throw new Error(`Invalid Regex: "${regexStr}"`);
    }
  }

  if (hasStart && hasEnd) {
    return { test: (v) => String(v) === content };
  }
  if (hasStart) {
    return { test: (v) => String(v).startsWith(content) };
  }
  if (hasEnd) {
    return { test: (v) => String(v).endsWith(content) };
  }

  return { test: (v) => String(v).includes(content) };
};

export const toPath = (input) => {
  let result = '';
  for (let i = 0, len = input.length; i < len; i += 1) {
    const char = input[i];
    if (typeof char === 'number') {
      result += `[${char}]`;
    } else {
      if (result.length > 0) {
        result += '.';
      }
      result += escape(char);
    }
  }
  return result;
};

export const formatNeedle = (n) => (Array.isArray(n) ? toPath(n) : n);
