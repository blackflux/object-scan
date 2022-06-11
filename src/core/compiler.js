/* compile needles to hierarchical map object */
import parser from './parser.js';
import iterator from '../generic/iterator.js';
import { defineProperty } from '../generic/helper.js';
import { Wildcard } from './wildcard.js';
import { Ref } from './ref.js';

const LEAF = Symbol('leaf');
const markLeaf = (input, match, readonly) => defineProperty(input, LEAF, match, readonly);
export const isLeaf = (input) => LEAF in input;
export const isMatch = (input) => input !== undefined && input[LEAF] === true;

const ROOTS = Symbol('roots');
const setRoots = (input, roots) => defineProperty(input, ROOTS, roots);
export const getRoots = (input) => input[ROOTS];

const HAS_MATCHES = Symbol('has-matches');
const setHasMatches = (input) => defineProperty(input, HAS_MATCHES, true);
export const hasMatches = (input) => input[HAS_MATCHES] === true;

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
export const getLeafNeedles = (input) => input[LEAF_NEEDLES] || [];

const LEAF_NEEDLES_EXCLUDE = Symbol('leaf-needles-exclude');
const addLeafNeedleExclude = (input, needle) => merge(input, LEAF_NEEDLES_EXCLUDE, needle);
export const getLeafNeedlesExclude = (input) => input[LEAF_NEEDLES_EXCLUDE] || [];

const LEAF_NEEDLES_MATCH = Symbol('leaf-needles-match');
const addLeafNeedleMatch = (input, needle) => merge(input, LEAF_NEEDLES_MATCH, needle);
export const getLeafNeedlesMatch = (input) => input[LEAF_NEEDLES_MATCH] || [];

const NEEDLES = Symbol('needles');
const addNeedle = (input, needle) => merge(input, NEEDLES, needle);
export const getNeedles = (input) => input[NEEDLES];

const INDEX = Symbol('index');
const setIndex = (input, index, readonly) => defineProperty(input, INDEX, index, readonly);
export const getIndex = (input) => input[INDEX];

const ORDER = Symbol('order');
const setOrder = (input, order) => defineProperty(input, ORDER, order);
export const getOrder = (input) => input[ORDER];

const WILDCARD = Symbol('wildcard');
const setWildcard = (input, wildcard) => defineProperty(input, WILDCARD, wildcard);
export const getWildcard = (input) => input[WILDCARD];

const VALUES = Symbol('values');
const setValues = (input, entries) => defineProperty(input, VALUES, entries);
export const getValues = (input) => input[VALUES];

export const matchedBy = (searches) => Array
  .from(new Set(searches.flatMap((e) => getLeafNeedlesMatch(e))));
export const excludedBy = (searches) => Array
  .from(new Set(searches.flatMap((e) => getLeafNeedlesExclude(e))));
export const traversedBy = (searches) => Array
  .from(new Set(searches.flatMap((e) => getNeedles(e))));

export const isLastLeafMatch = (searches) => {
  let maxLeafIndex = Number.MIN_SAFE_INTEGER;
  let maxLeaf = null;
  for (let idx = 0, len = searches.length; idx < len; idx += 1) {
    const s = searches[idx];
    const index = getIndex(s);
    if (index !== undefined && index > maxLeafIndex) {
      maxLeafIndex = index;
      maxLeaf = s;
    }
  }
  return maxLeaf !== null && isMatch(maxLeaf);
};

const iterate = (tower, needle, tree, { onAdd, onFin }) => {
  const stack = [[[tower, null]]];
  let excluded = false;

  iterator.iterate(tree, (type, wc) => {
    if (type === 'RM') {
      if (wc.excluded === true) {
        excluded = false;
      }
      stack.length -= 2;
    } else if (type === 'ADD') {
      if (wc.excluded === true) {
        if (excluded) {
          throw new Error(`Redundant Exclusion: "${needle}"`);
        }
        excluded = true;
      }
      const toAdd = [];
      const wcParent = stack[stack.length - 2];
      stack[stack.length - 1]
        .forEach(([cur, parent]) => onAdd(cur, parent, wc, wcParent, (e) => toAdd.push([e, cur])));
      stack.push(wc, toAdd);
    } else {
      stack[stack.length - 1]
        .filter(([cur]) => cur !== tower)
        .forEach(([cur, parent]) => onFin(cur, parent, wc[wc.length - 1], excluded));
    }
  });
};

const applyNeedle = (tower, needle, tree, ctx) => {
  iterate(tower, needle, tree, {
    onAdd: (cur, parent, wc, wcParent, next) => {
      if (wc instanceof Ref) {
        if (wc.left === true) {
          if (wc.isStarRec) {
            wc.setPointer(cur);
          }
          wc.setNode({});
          ctx.stack.push(cur, wc.node, true);
          next(wc.node);
        } else {
          // eslint-disable-next-line no-param-reassign
          wc.target = wcParent.target || parent[wcParent.value];
          ctx.stack.push(wc.target, wc.node, true);
          if (wc.pointer !== null) {
            next(wc.pointer);
            wc.setPointer(null);
          }
          next(cur);
        }
        return;
      }
      addNeedle(cur, needle);
      const redundantRecursion = (
        wcParent !== undefined
        && wc.isStarRec
        && wc.value === wcParent.value
      );
      if (redundantRecursion && ctx.strict) {
        throw new Error(`Redundant Recursion: "${needle}"`);
      }
      if (!redundantRecursion) {
        if (!(wc.value in cur)) {
          const child = {};
          // eslint-disable-next-line no-param-reassign
          cur[wc.value] = child;
          ctx.stack.push(cur, child, false);
          if (ctx.orderByNeedles) {
            setOrder(child, ctx.counter);
          }
          setWildcard(child, wc);
        }
        next(cur[wc.value]);
      } else {
        // eslint-disable-next-line no-param-reassign
        wc.target = cur;
      }
      if (wc.isStarRec) {
        next(cur);
      }
    },
    onFin: (cur, parent, wc, excluded) => {
      if (ctx.strict && wc.isSimpleStarRec) {
        const unnecessary = Object.keys(parent).filter((k) => !['**', ''].includes(k));
        if (unnecessary.length !== 0) {
          throw new Error(`Needle Target Invalidated: "${parent[unnecessary[0]][NEEDLES][0]}" by "${needle}"`);
        }
      }
      addNeedle(cur, needle);
      if (ctx.strict && LEAF_NEEDLES in cur) {
        throw new Error(`Redundant Needle Target: "${cur[LEAF_NEEDLES][0]}" vs "${needle}"`);
      }
      addLeafNeedle(cur, needle, ctx.strict);
      if (excluded) {
        addLeafNeedleExclude(cur, needle);
      } else {
        addLeafNeedleMatch(cur, needle);
      }
      markLeaf(cur, !excluded, ctx.strict);
      setIndex(cur, ctx.counter, ctx.strict);
      ctx.counter += 1;
    }
  });
};

const finalizeTower = (tower, ctx) => {
  const { stack } = ctx;
  const links = [];
  while (stack.length !== 0) {
    const link = stack.pop();
    const child = stack.pop();
    const parent = stack.pop();

    if (!(VALUES in child)) {
      setValues(child, Object.values(child).reverse());
    }
    if (link) {
      links.push(parent, child);
    }
    if (isMatch(child)) {
      setHasMatches(child);
    }
    if (hasMatches(child) && !hasMatches(parent)) {
      setHasMatches(parent);
    }
  }
  setValues(tower, Object.values(tower).reverse());

  for (let idx = 0, len = links.length; idx < len; idx += 2) {
    const parent = links[idx];
    const child = links[idx + 1];
    const values = parent[VALUES];
    values.push(...getValues(child).filter((v) => !values.includes(v)));
  }

  if (ctx.useArraySelector === false) {
    const roots = [];
    if ('' in tower) {
      roots.push(tower['']);
    }
    roots.push(...getValues(tower).filter((e) => getWildcard(e).isStarRec));
    setRoots(tower, roots);
  }
};

export const compile = (needles, ctx) => {
  const tower = {};
  ctx.counter = 0;
  ctx.stack = [];
  for (let idx = 0; idx < needles.length; idx += 1) {
    const needle = needles[idx];
    const tree = [parser.parse(needle, ctx)];
    applyNeedle(tower, needle, tree, ctx);
  }
  setWildcard(tower, new Wildcard('*', false));
  finalizeTower(tower, ctx);
  return tower;
};
