/* compile needles to hierarchical map object */
const parser = require('./parser');
const iterator = require('./iterator');
const { defineProperty, findLast, parseWildcard } = require('./helper');

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

const extractNeedles = (searches) => Array.from(new Set(searches.map((e) => getNeedle(e)).filter((e) => e !== null)));
module.exports.isLastLeafMatch = (searches) => isMatch(findLast(searches, (s) => isLeaf(s)));
module.exports.matchedBy = (searches) => extractNeedles(searches.filter((e) => isMatch(e)));
module.exports.excludedBy = (searches) => extractNeedles(searches.filter((e) => !isMatch(e)));
module.exports.traversedBy = (searches) => Array.from(new Set([].concat(...searches.map((e) => getNeedles(e)))));

const iterate = (tree, needle, cb) => {
  let excluded = false;
  iterator.iterate(tree, (type, p) => {
    if (type === 'RM') {
      if (p.isExcluded()) {
        excluded = false;
      }
    } else if (type === 'ADD') {
      const isExcluded = p.isExcluded();
      if (excluded && isExcluded) {
        throw new Error(`Redundant Exclusion: "${needle}"`);
      }
      if (isExcluded) {
        excluded = true;
      }
    }
    cb(type, p, excluded);
  });
};

const applyNeedle = (tower, needle, strict) => {
  const tree = [parser.parse(needle)];
  const stack = [[tower]];
  iterate(tree, needle, (type, p, excluded) => {
    if (type === 'RM') {
      stack.pop();
    } else if (type === 'ADD') {
      const next = [];
      stack[stack.length - 1].forEach((cur) => {
        addNeedle(cur, needle);
        if (cur[p] === undefined) {
          const child = {};
          // eslint-disable-next-line no-param-reassign
          cur[p] = child;
          if (String(p) === '**') {
            markRecursive(child);
          }
          setWildcardRegex(child, p);
        }
        next.push(cur[p]);
        if (String(p) === '**') {
          next.push(cur);
        }
      });
      stack.push(next);
    } else {
      stack[stack.length - 1]
        .filter((cur) => cur !== tower)
        .forEach((cur) => {
          addNeedle(cur, needle);
          if (strict && cur[NEEDLE] !== undefined) {
            throw new Error(`Redundant Needle Target: "${cur[NEEDLE]}" vs "${needle}"`);
          }
          setNeedle(cur, needle, strict);
          markLeaf(cur, !excluded, strict);
          if (isRecursive(cur)) {
            setRecursionPos(cur, Object.keys(cur).length, strict);
          }
        });
    }
  });
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
  for (let idx = 0; idx < needles.length; idx += 1) {
    const needle = needles[idx];
    applyNeedle(tower, needle, strict);
  }
  finalizeRecursive(tower);
  return tower;
};
