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
          const child = new Node(wc, ctx.counter);
          cur.set(wc.value, child);
          ctx.stack.push(cur, child, false);
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
      if (ctx.strict && cur.leafNeedles.length !== 0) {
        throw new Error(`Redundant Needle Target: "${cur.leafNeedles[0]}" vs "${needle}"`);
      }
      cur.finish(needle, excluded, ctx.counter);
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
    tower.setRoots(roots);
  }
};

export const compile = (needles, ctx) => {
  const tower = new Node(new Wildcard('*', false), ctx.counter);
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
