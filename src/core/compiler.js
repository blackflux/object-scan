/* compile needles to hierarchical map object */
const parser = require('./parser');
const iterator = require('../generic/iterator');
const traverser = require('../generic/traverser');
const { defineProperty } = require('../generic/helper');
const { Wildcard } = require('./wildcard');

const LEAF = Symbol('leaf');
const markLeaf = (input, match, readonly) => defineProperty(input, LEAF, match, readonly);
const isLeaf = (input) => input[LEAF] !== undefined;
const isMatch = (input) => input !== undefined && input[LEAF] === true;
module.exports.isLeaf = isLeaf;
module.exports.isMatch = isMatch;

const HAS_MATCHES = Symbol('has-matches');
const setHasMatches = (input) => defineProperty(input, HAS_MATCHES, true);
const hasMatches = (input) => input[HAS_MATCHES] === true;
module.exports.hasMatches = hasMatches;

const merge = (input, symbol, value) => {
  if (input[symbol] === undefined) {
    defineProperty(input, symbol, []);
  }
  if (!input[symbol].includes(value)) {
    input[symbol].push(value);
  }
};

const LEAF_NEEDLES = Symbol('leaf-needles');
const addLeafNeedle = (input, needle) => merge(input, LEAF_NEEDLES, needle);
const getLeafNeedles = (input) => input[LEAF_NEEDLES] || [];
module.exports.getLeafNeedles = getLeafNeedles;

const LEAF_NEEDLES_EXCLUDE = Symbol('leaf-needles-exclude');
const addLeafNeedleExclude = (input, needle) => merge(input, LEAF_NEEDLES_EXCLUDE, needle);
const getLeafNeedlesExclude = (input) => input[LEAF_NEEDLES_EXCLUDE] || [];
module.exports.getLeafNeedlesExclude = getLeafNeedlesExclude;

const LEAF_NEEDLES_MATCH = Symbol('leaf-needles-match');
const addLeafNeedleMatch = (input, needle) => merge(input, LEAF_NEEDLES_MATCH, needle);
const getLeafNeedlesMatch = (input) => input[LEAF_NEEDLES_MATCH] || [];
module.exports.getLeafNeedlesMatch = getLeafNeedlesMatch;

const NEEDLES = Symbol('needles');
const addNeedle = (input, needle) => merge(input, NEEDLES, needle);
const getNeedles = (input) => input[NEEDLES];
module.exports.getNeedles = getNeedles;

const INDEX = Symbol('index');
const setIndex = (input, index, readonly) => defineProperty(input, INDEX, index, readonly);
const getIndex = (input) => (input[INDEX] === undefined ? null : input[INDEX]);
module.exports.getIndex = getIndex;

const WILDCARD = Symbol('wildcard');
const setWildcard = (input, wildcard) => defineProperty(input, WILDCARD, wildcard);
const getWildcard = (input) => input[WILDCARD];
module.exports.getWildcard = getWildcard;

const VALUES = Symbol('values');
const setValues = (input, entries) => defineProperty(input, VALUES, entries);
const getValues = (input) => input[VALUES];
module.exports.getValues = getValues;

module.exports.excludedBy = (searches) => Array
  .from(new Set([].concat(...searches.map((e) => getLeafNeedlesExclude(e)))));
module.exports.matchedBy = (searches) => Array
  .from(new Set([].concat(...searches.map((e) => getLeafNeedlesMatch(e)))));
module.exports.traversedBy = (searches) => Array
  .from(new Set([].concat(...searches.map((e) => getNeedles(e)))));

module.exports.isLastLeafMatch = (searches) => {
  let maxLeafIndex = Number.MIN_SAFE_INTEGER;
  let maxLeaf = null;
  searches.forEach((s) => {
    const index = getIndex(s);
    if (index !== null && index > maxLeafIndex) {
      maxLeafIndex = index;
      maxLeaf = s;
    }
  });
  return maxLeaf !== null && isMatch(maxLeaf);
};

const iterate = (tower, needle, tree, { onAdd, onFin }) => {
  const stack = [[[tower, null]]];
  const wildcards = [];
  let excluded = false;

  iterator.iterate(tree, (type, wc) => {
    if (type === 'RM') {
      if (wc.excluded === true) {
        excluded = false;
      }
      stack.pop();
      wildcards.pop();
    } else if (type === 'ADD') {
      if (wc.excluded === true) {
        if (excluded) {
          throw new Error(`Redundant Exclusion: "${needle}"`);
        }
        excluded = true;
      }
      const toAdd = [];
      const wcParent = wildcards[wildcards.length - 1];
      stack[stack.length - 1]
        .forEach(([cur]) => onAdd(cur, wc, wcParent, (e) => toAdd.push([e, cur])));
      stack.push(toAdd);
      wildcards.push(wc);
    } else {
      stack[stack.length - 1]
        .filter(([cur]) => cur !== tower)
        .forEach(([cur, parent]) => onFin(cur, wc[wc.length - 1], parent, excluded));
    }
  });
};

const applyNeedle = (tower, needle, tree, strict, ctx) => {
  iterate(tower, needle, tree, {
    onAdd: (cur, wc, wcParent, next) => {
      addNeedle(cur, needle);
      const redundantRecursion = (
        wcParent !== undefined
        && wc.isStarRec
        && wc.value === wcParent.value
      );
      if (redundantRecursion && strict) {
        throw new Error(`Redundant Recursion: "${needle}"`);
      }
      if (!redundantRecursion) {
        if (cur[wc] === undefined) {
          const child = {};
          // eslint-disable-next-line no-param-reassign
          cur[wc] = child;
          setWildcard(child, wc);
        }
        next(cur[wc]);
      }
      if (wc.isStarRec) {
        next(cur);
      }
    },
    onFin: (cur, wc, parent, excluded) => {
      if (strict) {
        if (wc.value === '**') {
          const unnecessary = Object.keys(parent).filter((k) => !['**', ''].includes(k));
          if (unnecessary.length !== 0) {
            throw new Error(`Needle Target Invalidated: "${parent[unnecessary[0]][NEEDLES][0]}" by "${needle}"`);
          }
        }
      }
      addNeedle(cur, needle);
      if (strict && cur[LEAF_NEEDLES] !== undefined) {
        throw new Error(`Redundant Needle Target: "${cur[LEAF_NEEDLES][0]}" vs "${needle}"`);
      }
      addLeafNeedle(cur, needle, strict);
      if (excluded) {
        addLeafNeedleExclude(cur, needle);
      } else {
        addLeafNeedleMatch(cur, needle);
      }
      markLeaf(cur, !excluded, strict);
      setIndex(cur, ctx.index, strict);
      ctx.index += 1;
    }
  });
};

const finalizeTower = (tower) => {
  const matches = [];
  let lastDepth = -1;

  traverser.traverse(tower, (type, obj, depth) => {
    if (type === 'EXIT') {
      const isUp = lastDepth === depth + 1;
      if ((isUp && matches[lastDepth] === true) || isMatch(obj)) {
        matches[depth] = true;
        setHasMatches(obj);
      }
      if (isUp) {
        matches[lastDepth] = false;
      }
      setValues(obj, Object.entries(obj).filter(([k]) => k !== '').map((e) => e[1]));
      lastDepth = depth;
    }
  });
};

module.exports.compile = (needles, strict = true, useArraySelector = true) => {
  const tower = {};
  const ctx = { index: 0 };
  for (let idx = 0; idx < needles.length; idx += 1) {
    const needle = needles[idx];
    const tree = [parser.parse(needle, useArraySelector)];
    applyNeedle(tower, needle, tree, strict, ctx);
  }
  setWildcard(tower, new Wildcard('*', false));
  finalizeTower(tower);
  return tower;
};
