/* compile needles to hierarchical map object */
const parser = require('./parser');
const { defineProperty, findLast, parseWildcard } = require('./helper');

const LEAF = Symbol('leaf');
const markLeaf = (input, match, readonly) => defineProperty(input, LEAF, match, readonly);
const isLeaf = (input) => input[LEAF] !== undefined;
const isMatch = (input) => input !== undefined && input[LEAF] === true;
const isExclude = (input) => input !== undefined && input[LEAF] === false;
module.exports.isLeaf = isLeaf;
module.exports.isMatch = isMatch;
module.exports.isExclude = isExclude;

const HAS_MATCHES = Symbol('has-matches');
const setHasMatches = (input) => defineProperty(input, HAS_MATCHES, true);
const hasMatches = (input) => input[HAS_MATCHES] === true;
module.exports.hasMatches = hasMatches;

const NEEDLE = Symbol('needle');
const setNeedle = (input, needle, readonly) => defineProperty(input, NEEDLE, needle, readonly);
const getNeedle = (input) => (input[NEEDLE] === undefined ? null : input[NEEDLE]);
module.exports.getNeedle = getNeedle;

const NEEDLES = Symbol('needles');
const addNeedle = (input, needle) => {
  if (input[NEEDLES] === undefined) {
    defineProperty(input, NEEDLES, new Set());
  }
  input[NEEDLES].add(needle);
};
const getNeedles = (input) => [...input[NEEDLES]];
module.exports.getNeedles = getNeedles;

const WILDCARD_REGEX = Symbol('wildcard-regex');
const setWildcardRegex = (input, wildcard) => defineProperty(input, WILDCARD_REGEX, parseWildcard(wildcard));
const getWildcardRegex = (input) => input[WILDCARD_REGEX];
module.exports.getWildcardRegex = getWildcardRegex;

const RECURSIVE = Symbol('recursive');
const markRecursive = (input) => defineProperty(input, RECURSIVE, true);
const isRecursive = (input) => input[RECURSIVE] === true;
module.exports.isRecursive = isRecursive;

const RECURSION_POS = Symbol('recursion-pos');
const setRecursionPos = (input, pos, readonly) => defineProperty(input, RECURSION_POS, pos, readonly);
const getRecursionPos = (input) => input[RECURSION_POS] || 0;
module.exports.getRecursionPos = getRecursionPos;

const ENTRIES = Symbol('entries');
const setEntries = (input, entries) => defineProperty(input, ENTRIES, entries);
const getEntries = (input) => input[ENTRIES];
module.exports.getEntries = getEntries;

module.exports.getMeta = (() => {
  const extractNeedles = (input) => Array.from(input.reduce((p, e) => {
    const needle = getNeedle(e);
    if (needle !== null) {
      p.add(needle);
    }
    return p;
  }, new Set()));
  return (inputs, parents = null) => ({
    isMatch: isMatch(findLast(inputs, (s) => isLeaf(s))),
    matchedBy: extractNeedles(inputs.filter((e) => isMatch(e))),
    excludedBy: extractNeedles(inputs.filter((e) => !isMatch(e))),
    traversedBy: Array.from(inputs.reduce((p, e) => {
      getNeedles(e).forEach((n) => p.add(n));
      return p;
    }, new Set())),
    parents: parents !== null ? [...parents].reverse() : null
  });
})();

const buildRecursive = (tower, path, ctx, excluded, root = false) => {
  if (path.length === 1 && String(path[0]) === '**' && (excluded || path[0].isExcluded())) {
    Object.keys(tower).forEach((k) => {
      // eslint-disable-next-line no-param-reassign
      delete tower[k];
    });
  }
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

const finalizeRecursive = (tower) => {
  const towerValues = Object.values(tower);
  towerValues.forEach((v) => finalizeRecursive(v));
  if (isMatch(tower) || towerValues.some((v) => hasMatches(v))) {
    setHasMatches(tower);
  }
  setEntries(tower, Object.entries(tower).filter(([k]) => k !== ''));
};

module.exports.compile = (needles, strict = true) => {
  const tower = {};
  needles.forEach((needle) => buildRecursive(tower, [parser(needle)], { needle, strict }, false, true));
  finalizeRecursive(tower);
  return tower;
};
