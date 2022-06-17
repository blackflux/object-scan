/* compile needles to hierarchical map object */
import parser from './parser.js';
import iterator from './compiler-iterator.js';
import { defineProperty } from '../generic/helper.js';
import { Wildcard } from './wildcard.js';
import { Ref } from './ref.js';
import { Node } from './node.js';

const ROOTS = Symbol('roots');
const setRoots = (input, roots) => defineProperty(input, ROOTS, roots);
export const getRoots = (input) => input[ROOTS];

const merge = (input, symbol, ...values) => {
  const target = input[symbol];
  if (target === undefined) {
    defineProperty(input, symbol, values);
  } else {
    target.push(...values.filter((v) => !target.includes(v)));
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

const ORDER = Symbol('order');
const setOrder = (input, order) => defineProperty(input, ORDER, order);
export const getOrder = (input) => input[ORDER];

export const matchedBy = (searches) => Array
  .from(new Set(searches.flatMap((e) => getLeafNeedlesMatch(e))));
export const excludedBy = (searches) => Array
  .from(new Set(searches.flatMap((e) => getLeafNeedlesExclude(e))));
export const traversedBy = (searches) => Array
  .from(new Set(searches.flatMap((e) => e.needles)));

export const isLastLeafMatch = (searches) => {
  let maxLeafIndex = Number.MIN_SAFE_INTEGER;
  let maxLeaf = null;
  for (let idx = 0, len = searches.length; idx < len; idx += 1) {
    const s = searches[idx];
    const { index } = s;
    if (index !== undefined && index > maxLeafIndex) {
      maxLeafIndex = index;
      maxLeaf = s;
    }
  }
  return maxLeaf !== null && maxLeaf.match === true;
};

const applyNeedle = (tower, needle, tree, ctx) => {
  iterator(tower, needle, tree, {
    onAdd: (cur, parent, wc, wcParent, next) => {
      cur.addNeedle(needle);
      if (wc instanceof Ref) {
        if (wc.left === true) {
          if (wc.isStarRec) {
            wc.setPointer(cur);
          }
          wc.setNode(new Node());
          ctx.stack.push(cur, wc.node, true);
          next(wc.node);
        } else {
          // eslint-disable-next-line no-param-reassign
          wc.target = 'target' in wcParent ? wcParent.target : parent.get(wcParent.value);
          ctx.stack.push(wc.target, wc.node, true);
          if (wc.pointer !== null) {
            next(wc.pointer);
            wc.setPointer(null);
          }
          next(cur);
        }
        return;
      }
      const redundantRecursion = (
        wcParent !== undefined
        && wc.isStarRec
        && wc.value === wcParent.value
      );
      if (redundantRecursion && ctx.strict) {
        throw new Error(`Redundant Recursion: "${needle}"`);
      }
      if (!redundantRecursion) {
        if (!cur.has(wc.value)) {
          const child = new Node(wc);
          cur.set(wc.value, child);
          ctx.stack.push(cur, child, false);
          if (ctx.orderByNeedles) {
            setOrder(child, ctx.counter);
          }
        }
        next(cur.get(wc.value));
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
        const unnecessary = [...parent.keys()].filter((k) => !['**', ''].includes(k));
        if (unnecessary.length !== 0) {
          throw new Error(`Needle Target Invalidated: "${parent.get(unnecessary[0]).needles[0]}" by "${needle}"`);
        }
      }
      cur.addNeedle(needle);
      if (ctx.strict && LEAF_NEEDLES in cur) {
        throw new Error(`Redundant Needle Target: "${cur[LEAF_NEEDLES][0]}" vs "${needle}"`);
      }
      addLeafNeedle(cur, needle, ctx.strict);
      if (excluded) {
        addLeafNeedleExclude(cur, needle);
      } else {
        addLeafNeedleMatch(cur, needle);
      }
      cur.setMatch(!excluded);
      cur.setIndex(ctx.counter);
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

    if (link) {
      links.push(parent, child);
    }
    if (child.matches) {
      parent.markMatches();
    }
  }

  for (let idx = 0, len = links.length; idx < len; idx += 2) {
    const parent = links[idx];
    const child = links[idx + 1];
    parent.vs.push(...child.vs.filter((v) => !parent.vs.includes(v)));
  }

  if (ctx.useArraySelector === false) {
    const roots = [];
    if (tower.has('')) {
      roots.push(tower.get(''));
    }
    roots.push(...tower.vs.filter((e) => e.wildcard.isStarRec));
    setRoots(tower, roots);
  }
};

export const compile = (needles, ctx) => {
  const tower = new Node(new Wildcard('*', false));
  ctx.counter = 0;
  ctx.stack = [];
  for (let idx = 0; idx < needles.length; idx += 1) {
    const needle = needles[idx];
    const tree = [parser.parse(needle, ctx)];
    applyNeedle(tower, needle, tree, ctx);
  }
  finalizeTower(tower, ctx);
  return tower;
};
