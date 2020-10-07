const findDepth = (obj, depth, ctx) => {
  if (Array.isArray(obj)) {
    ctx.nodes += 1;
    ctx.branches += obj.length;
    return obj.reduce((p, c) => Math.max(p, findDepth(c, depth + 1, ctx)), depth);
  }
  if (obj instanceof Object) {
    const values = Object.values(obj);
    ctx.nodes += 1;
    ctx.branches += values.length;
    return values.reduce((p, c) => Math.max(p, findDepth(c, depth + 1, ctx)), depth);
  }
  ctx.leaves += 1;
  return depth;
};

module.exports = (obj) => {
  const ctx = { leaves: 0, nodes: 0, branches: 0 };
  const depth = findDepth(obj, 0, ctx);
  return {
    depth,
    leaves: ctx.leaves,
    branchingFactor: ctx.branches / ctx.nodes
  };
};
