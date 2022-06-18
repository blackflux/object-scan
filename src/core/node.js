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
    return { test: (v) => v === regex };
  }
  if (regex === '.+') {
    return { test: (v) => v !== '' };
  }
  return new RegExp(`^${regex}$`);
};

const compileValue = (value) => {
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

export class Node {
  constructor(value, ctx) {
    ctx.nodes.push(this);
    this.value = value;
    this.ctx = ctx;
    this.order = ctx.counter;
    this.children = [];
    this.match = false;
    this.matches = false;
    this.needles = [];
    this.leafNeedles = [];
    this.leafNeedlesExclude = [];
    this.leafNeedlesMatch = [];

    this.isArrayTarget = value.startsWith('[') && value.endsWith(']');
    this.isSimpleStarRec = value === '**';
    this.isSimplePlusRec = value === '++';
    this.isSimpleRec = this.isSimpleStarRec || this.isSimplePlusRec;
    this.isRegexStarRec = value.startsWith('**(') && value.endsWith(')');
    this.isRegexPlusRec = value.startsWith('++(') && value.endsWith(')');
    this.isStarRec = this.isSimpleStarRec || this.isRegexStarRec;
    this.isPlusRec = this.isSimplePlusRec || this.isRegexPlusRec;
    this.isRec = this.isStarRec || this.isPlusRec;
    this.isAnyArrayTarget = value === '[*]';
    this.isAnyObjTarget = value === '*';
    if (this.isSimpleRec || this.isAnyObjTarget || this.isAnyArrayTarget) {
      this.regex = null;
    } else {
      const { regex } = ctx;
      if (!(value in regex)) {
        regex[value] = compileValue(value);
      }
      this.regex = regex[value];
    }
  }

  recMatch(key) {
    if (!this.isRec) {
      return false;
    }
    if (this.isSimpleRec) {
      return true;
    }
    return this.regex.test(key);
  }

  typeMatch(key, isArray) {
    if (this.isSimpleRec) {
      return true;
    }
    if (this.isAnyArrayTarget) {
      return isArray;
    }
    if (this.isAnyObjTarget) {
      return !isArray;
    }
    if (
      isArray !== this.isArrayTarget
      && !this.isRec
    ) {
      return false;
    }
    return this.regex.test(key);
  }

  add(v) {
    this.children.push(v);
  }

  get(k) {
    return this.children.find(({ value }) => value === k);
  }

  markMatches() {
    this.matches = true;
  }

  addNeedle(needle) {
    if (!this.needles.includes(needle)) {
      this.needles.push(needle);
    }
  }

  setRoots(roots) {
    this.roots = roots;
  }

  finish(needle, excluded, index) {
    this.addNeedle(needle);
    if (!this.leafNeedles.includes(needle)) {
      this.leafNeedles.push(needle);
    }
    const target = excluded ? this.leafNeedlesExclude : this.leafNeedlesMatch;
    if (!target.includes(needle)) {
      target.push(needle);
    }
    this.match = !excluded;
    this.matches = this.match;
    this.index = index;
  }
}
