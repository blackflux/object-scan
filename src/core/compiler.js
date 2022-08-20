/* compile needles to hierarchical map object */
import parser from './parser.js';
import iterator from './compiler-iterator.js';
import { Ref } from './parser-ref.js';
import { Node } from './node.js';
import { formatNeedle } from '../generic/helper.js';

const applyNeedle = (tower, needle, tree, ctx) => {
  iterator(tower, needle, tree, {
    onAdd: (cur, parent, v, vParent, next) => {
      cur.addNeedle(needle);
      if (v instanceof Ref) {
        if (v.left === true) {
          if (v.isStarRec) {
            v.setPointer(cur);
          }
          v.setNode(new Node('*', ctx));
          ctx.links.push(cur, v.node);
          next(v.node);
        } else {
          // eslint-disable-next-line no-param-reassign
          v.target = 'target' in vParent ? vParent.target : parent.get(vParent.value);
          ctx.links.push(v.target, v.node);
          if (v.pointer !== null) {
            next(v.pointer);
            v.setPointer(null);
          }
          next(cur);
        }
        return;
      }
      const redundantRecursion = (
        v.isStarRec
        && v.value === vParent?.value
      );
      if (redundantRecursion && ctx.strict) {
        throw new Error(`Redundant Recursion: "${needle}"`);
      }
      if (!redundantRecursion) {
        let node = cur.get(v.value);
        if (node === undefined) {
          node = new Node(v.value, ctx);
          cur.add(node);
        }
        next(node);
      } else {
        // eslint-disable-next-line no-param-reassign
        v.target = cur;
      }
      if (v.isStarRec) {
        next(cur);
      }
    },
    onFin: (cur, parent, v, excluded) => {
      if (ctx.strict && v.isSimpleStarRec) {
        const unnecessary = parent.children.filter(({ value }) => !['', '**'].includes(value));
        if (unnecessary.length !== 0) {
          throw new Error(`Needle Target Invalidated: "${unnecessary[0].needles[0]}" by "${needle}"`);
        }
      }
      if (ctx.strict && cur.leafNeedles.length !== 0) {
        const nLeft = formatNeedle(cur.leafNeedles[0]);
        const nRight = formatNeedle(needle);
        throw new Error(`Redundant Needle Target: "${nLeft}" vs "${nRight}"`);
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
    const { children } = parent;
    parent.children = [...child.children.filter((c) => !children.includes(c)), ...children];
  }

  if (ctx.useArraySelector === false) {
    tower.setRoots(tower.children
      .filter(({ isStarRec, value }) => isStarRec || value === ''));
  }

  const { nodes } = ctx;
  while (nodes.length !== 0) {
    const node = nodes.pop();
    const { children } = node;
    children.reverse();
    if (children.some(({ matches }) => matches)) {
      node.markMatches();
    }
  }
};

export const compile = (needles, ctx) => {
  ctx.counter = 0;
  ctx.links = [];
  ctx.nodes = [];
  ctx.regex = Object.create(null);
  const tower = new Node('*', ctx);
  for (let idx = 0; idx < needles.length; idx += 1) {
    const needle = needles[idx];
    const tree = [parser.parse(needle, ctx)];
    applyNeedle(tower, needle, tree, ctx);
  }
  finalizeTower(tower, ctx);
  return tower;
};
