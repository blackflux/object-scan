/* compile needles to hierarchical map object */
import parser from './parser';
import { defineProperty, findLast, parseWildcard } from './helper';

const LEAF = Symbol('leaf');
const markLeaf = (input: string, match: boolean, readonly: boolean) => defineProperty(input, LEAF, match, readonly);
const isLeaf = (input: any) => input[LEAF] !== undefined;
const isMatch = (input: any) => input !== undefined && input[LEAF] === true;
export { isLeaf };
export { isMatch };

const HAS_MATCHES = Symbol('has-matches');
const setHasMatches = (input: any) => defineProperty(input, HAS_MATCHES, true);
const hasMatches = (input: any) => input[HAS_MATCHES] === true;
export { hasMatches };

const NEEDLE = Symbol('needle');
const setNeedle = (input: any, needle: string, readonly: boolean) => defineProperty(input, NEEDLE, needle, readonly);
const getNeedle = (input: any) => (input[NEEDLE] === undefined ? null : input[NEEDLE]);
export { getNeedle };

const NEEDLES = Symbol('needles');
const addNeedle = (input: any, needle: any) => {
  if (input[NEEDLES] === undefined) {
    defineProperty(input, NEEDLES, new Set());
  }
  input[NEEDLES].add(needle);
};
const getNeedles = (input: any) => [...input[NEEDLES]];
export { getNeedles };

const WILDCARD_REGEX = Symbol('wildcard-regex');
const setWildcardRegex = (input: any, wildcard: string) => defineProperty(
  input,
  WILDCARD_REGEX,
  parseWildcard(wildcard)
);
const getWildcardRegex = (input: any) => input[WILDCARD_REGEX];
export { getWildcardRegex };

const RECURSIVE = Symbol('recursive');
const markRecursive = (input: any) => defineProperty(input, RECURSIVE, true);
const isRecursive = (input: any) => input[RECURSIVE] === true;
export { isRecursive };

const RECURSION_POS = Symbol('recursion-pos');
const setRecursionPos = (input: any, pos: number, readonly: boolean) => defineProperty(
  input,
  RECURSION_POS,
  pos,
  readonly
);
const getRecursionPos = (input: any) => input[RECURSION_POS] || 0;
export { getRecursionPos };

const ENTRIES = Symbol('entries');
const setEntries = (input: any, entries: any) => defineProperty(input, ENTRIES, entries);
const getEntries = (input: any) => input[ENTRIES];
export { getEntries };

export const getMeta = (() => {
  const extractNeedles = (input: any) => Array.from(input.reduce((p: any, e: any) => {
    const needle = getNeedle(e);
    if (needle !== null) {
      p.add(needle);
    }
    return p;
  }, new Set()));
  return (inputs: any, parents: any = null) => ({
    isMatch: isMatch(findLast(inputs, (s: any) => isLeaf(s))),
    matchedBy: extractNeedles(inputs.filter((e: any) => isMatch(e))),
    excludedBy: extractNeedles(inputs.filter((e: any) => !isMatch(e))),
    traversedBy: Array.from(inputs.reduce((p: any, e: any) => {
      getNeedles(e).forEach((n) => p.add(n));
      return p;
    }, new Set())),
    parents: parents !== null ? [...parents].reverse() : null
  });
})();

const buildRecursive = (tower: any, path: any, ctx: any, excluded: any, root = false) => {
  addNeedle(tower, ctx.needle);
  if (path.length === 0) {
    if (tower[NEEDLE] !== undefined && ctx.strict) {
      throw new Error(`Redundant Needle Target: "${tower[NEEDLE]}" vs "${ctx.needle}"`);
    }
    setNeedle(tower, ctx.needle, ctx.strict);
    markLeaf(tower, !excluded, ctx.strict);
    if (isRecursive(tower)) {
      setRecursionPos(tower, Object.keys(tower).length, ctx.strict);
    }
    return;
  }
  if (Array.isArray(path[0])) {
    buildRecursive(tower, [...path[0], ...path.slice(1)], ctx, excluded);
    return;
  }
  if (path[0] instanceof Set) {
    path[0].forEach((c) => buildRecursive(tower, [c, ...path.slice(1)], ctx, excluded));
    return;
  }
  if (tower[path[0]] === undefined) {
    Object.assign(tower, { [path[0]]: {} });
    if (String(path[0]) === '**') {
      markRecursive(tower[path[0]]);
    }
    setWildcardRegex(tower[path[0]], path[0]);
  }
  if (excluded && path[0].isExcluded()) {
    throw new Error(`Redundant Exclusion: "${ctx.needle}"`);
  }
  if (root === false && String(path[0]) === '**') {
    buildRecursive(tower, path.slice(1), ctx, excluded || path[0].isExcluded());
  }
  buildRecursive(tower[path[0]], path.slice(1), ctx, excluded || path[0].isExcluded());
};

const finalizeRecursive = (tower: any) => {
  const towerValues = Object.values(tower);
  towerValues.forEach((v) => finalizeRecursive(v));
  if (isMatch(tower) || towerValues.some((v) => hasMatches(v))) {
    setHasMatches(tower);
  }
  setEntries(tower, Object.entries(tower).filter(([k]) => k !== ''));
};

export const compile = (needles: any, strict: boolean = true) => {
  const tower = {};
  needles.forEach((needle: any) => buildRecursive(tower, [parser(needle)], { needle, strict }, false, true));
  finalizeRecursive(tower);
  return tower;
};
