/* compile needles to hierarchical map object */
import parser from './parser.js';
import iterator from './compiler-iterator.js';
import { Wildcard } from './wildcard.js';
import { Ref } from './ref.js';
import { Node } from './node.js';

const applyNeedle = (tower, needle, tree, ctx) => {
  iterator(tower, needle, tree, {
    onAdd: (cur, parent, wc, wcParent, next) => {
      cur.addNeedle(needle);
      if (wc instanceof Ref) {
        if (wc.left === true) {
          if (wc.isStarRec) {
            wc.setPointer(cur);
          }
          wc.setNode(new Node(null, ctx));
          ctx.links.push(cur, wc.node);
          next(wc.node);
        } else {
          // eslint-disable-next-line no-param-reassign
          wc.target = 'target' in wcParent ? wcParent.target : parent.get(wcParent.value);
          ctx.links.push(wc.target, wc.node);
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
          const child = new Node(wc, ctx);
          cur.add(child);
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
        const unnecessary = parent.vs.filter(({ wildcard }) => !['', '**'].includes(wildcard.value));
        if (unnecessary.length !== 0) {
          throw new Error(`Needle Target Invalidated: "${unnecessary[0].needles[0]}" by "${needle}"`);
        }
      }
      if (ctx.strict && cur.leafNeedles.length !== 0) {
        throw new Error(`Redundant Needle Target: "${cur.leafNeedles[0]}" vs "${needle}"`);
      }
      cur.finish(needle, excluded, ctx.counter);
      ctx.counter += 1;
    }
  });
};

const finalizeTower = (tower, ctx) => {
  const { links } = ctx;
  while (links.length !== 0) {
    const child = links.pop();
    const parent = links.pop();
    const { vs } = parent;
    parent.vs = [...child.vs.filter((v) => !vs.includes(v)), ...vs];
  }

  const { nodes } = ctx;
  while (nodes.length !== 0) {
    const node = nodes.pop();
    const { vs } = node;
    vs.reverse();
    if (vs.some((v) => v.matches)) {
      node.markMatches();
    }
  }

  if (ctx.useArraySelector === false) {
    const roots = [];
    if (tower.has('')) {
      roots.push(tower.get(''));
    }
    roots.push(...tower.vs.filter((e) => e.wildcard.isStarRec));
    tower.setRoots(roots);
  }
};

export const compile = (needles, ctx) => {
  ctx.counter = 0;
  ctx.links = [];
  ctx.nodes = [];
  const tower = new Node(new Wildcard('*', false), ctx);
  for (let idx = 0; idx < needles.length; idx += 1) {
    const needle = needles[idx];
    const tree = [parser.parse(needle, ctx)];
    applyNeedle(tower, needle, tree, ctx);
  }
  finalizeTower(tower, ctx);
  return tower;
};
