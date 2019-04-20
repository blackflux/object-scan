/* compile needles to hierarchical map object */
const parser = require('./parser');
const { defineProperty } = require('./helper');

const LEAF = Symbol('leaf');
const markLeaf = (input, match) => defineProperty(input, LEAF, match);
const isLeaf = input => input[LEAF] !== undefined;
const isMatch = input => input !== undefined && input[LEAF] === true;
module.exports.isLeaf = isLeaf;
module.exports.isMatch = isMatch;

const MATCHABLE = Symbol('matchable');
const setMatchable = input => defineProperty(input, MATCHABLE, true);
const isMatchable = input => input[MATCHABLE] === true;
module.exports.isMatchable = isMatchable;

const NEEDLE = Symbol('needle');
const setNeedle = (input, needle) => defineProperty(input, NEEDLE, needle);
const getNeedle = input => (input[NEEDLE] === undefined ? null : input[NEEDLE]);
module.exports.getNeedle = getNeedle;

const NEEDLES = Symbol('needles');
const addNeedle = (input, needle) => {
  if (input[NEEDLES] === undefined) {
    defineProperty(input, NEEDLES, new Set());
  }
  input[NEEDLES].add(needle);
};
const getNeedles = input => [...input[NEEDLES]];
module.exports.getNeedles = getNeedles;

const WILDCARD_REGEX = Symbol('wildcard-regex');
const setWildcardRegex = (input, wildcard) => {
  defineProperty(input, WILDCARD_REGEX, new RegExp(`^${wildcard
    .split(/(?<!\\)(?:\\\\)*\*/)
    .map(p => p.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'))
    .join('.*')}$`));
};
const getWildcardRegex = input => input[WILDCARD_REGEX];
module.exports.getWildcardRegex = getWildcardRegex;

const RECURSIVE = Symbol('recursive');
const markRecursive = input => defineProperty(input, RECURSIVE, true);
const isRecursive = input => input[RECURSIVE] === true;
module.exports.isRecursive = isRecursive;

const RECURSION_POS = Symbol('recursion-pos');
const setRecursionPos = (input, pos) => defineProperty(input, RECURSION_POS, pos);
const getRecursionPos = input => input[RECURSION_POS] || 0;
module.exports.getRecursionPos = getRecursionPos;

module.exports.getMeta = (inputs, parents = null) => ({
  isMatch: inputs.some(e => isMatch(e)),
  // todo: revisit "matchedBy"
  matchedBy: Array.from(inputs.reduce((p, e) => {
    const needle = getNeedle(e);
    if (needle !== null) {
      p.add(needle);
    }
    return p;
  }, new Set())),
  traversedBy: Array.from(inputs.reduce((p, e) => {
    getNeedles(e).forEach(n => p.add(n));
    return p;
  }, new Set())),
  parents
});

const buildRecursive = (tower, path, needle, excluded = false) => {
  addNeedle(tower, needle);
  if (path.length === 0) {
    if (tower[NEEDLE] !== undefined) {
      throw new Error(`Redundant Needle Target: "${tower[NEEDLE]}" vs "${needle}"`);
    }
    setNeedle(tower, needle);
    markLeaf(tower, !excluded);
    if (isRecursive(tower)) {
      setRecursionPos(tower, Object.keys(tower).length);
    }
    if (!excluded) {
      setMatchable(tower);
    }
    return;
  }
  if (Array.isArray(path[0])) {
    buildRecursive(tower, [...path[0], ...path.slice(1)], needle, excluded);
    return;
  }
  if (path[0] instanceof Set) {
    path[0].forEach(c => buildRecursive(tower, [c, ...path.slice(1)], needle, excluded));
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
    throw new Error(`Redundant Exclusion: "${needle}"`);
  }
  buildRecursive(tower[path[0]], path.slice(1), needle, excluded || path[0].isExcluded());
};

const pullUpMatchable = (tower) => {
  const towerValues = Object.values(tower);
  towerValues.forEach(v => pullUpMatchable(v));
  if (towerValues.some(v => isMatchable(v))) {
    setMatchable(tower);
  }
};

module.exports.compile = (needles) => {
  const tower = {};
  needles.forEach(needle => buildRecursive(tower, [parser(needle)], needle));
  pullUpMatchable(tower);
  return tower;
};
