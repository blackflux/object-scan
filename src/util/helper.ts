export const defineProperty = (target: string, k: any, v: any, readonly: boolean = true) => Object
  .defineProperty(target, k, { value: v, writable: !readonly });

export const findLast = (array: string[], fn: Function): string | undefined => {
  for (let idx: number = array.length - 1; idx >= 0; idx -= 1) {
    const item = array[idx];
    if (fn(item)) {
      return item;
    }
  }
  return undefined;
};

export const parseWildcard = (input: string) => {
  let regex = '';
  let escaped = false;
  for (let idx = 0; idx < input.length; idx += 1) {
    const char = input[idx];
    if (!escaped && char === '*') {
      regex += '.*';
    } else if (!escaped && char === '?') {
      regex += '.';
    } else if (['|', '\\', '{', '}', '(', ')', '[', ']', '^', '$', '+', '*', '?', '.'].includes(char)) {
      regex += `\\${char}`;
    } else {
      regex += char;
    }
    escaped = char === '\\' ? !escaped : false;
  }
  return new RegExp(`^${regex}$`);
};
