const findDepth = (obj, depth, ctx) => {
  if (Array.isArray(obj)) {
    ctx.nodes += 1;
    ctx.branches += obj.length;
    ctx.hasArray = true;
    return obj.reduce((p, c) => Math.max(p, findDepth(c, depth + 1, ctx)), depth);
  }
  if (obj instanceof Object) {
    const values = Object.values(obj);
    ctx.nodes += 1;
    ctx.branches += values.length;
    ctx.hasObject = true;
    return values.reduce((p, c) => Math.max(p, findDepth(c, depth + 1, ctx)), depth);
  }
  ctx.leaves += 1;
  return depth;
};

module.exports = (obj) => {
  const ctx = {
    leaves: 0,
    nodes: 0,
    branches: 0,
    hasArray: false,
    hasObject: false
  };
  const depth = findDepth(obj, 0, ctx);
  return {
    depth,
    leaves: ctx.leaves,
    branchingFactor: ctx.branches / ctx.nodes,
    hasArray: ctx.hasArray,
    hasObject: ctx.hasObject
  };
};
