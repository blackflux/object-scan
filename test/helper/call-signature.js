module.exports = ({
  objectScan,
  haystack,
  needles,
  useArraySelector = true,
  reverse = true,
  orderByNeedles = false
}) => {
  const logs = [];
  const cb = (cbName) => ({
    key,
    value,
    property,
    gproperty,
    parent,
    gparent,
    parents,
    isMatch,
    matchedBy,
    excludedBy,
    traversedBy,
    isCircular,
    isLeaf,
    depth,
    result
  }) => {
    logs.push({
      cbName,
      key,
      value,
      property,
      gproperty,
      parent,
      gparent,
      parents,
      isMatch,
      matchedBy,
      excludedBy,
      traversedBy,
      isCircular,
      isLeaf,
      depth,
      result: [...result]
    });
  };
  const kwargs = {
    useArraySelector,
    reverse,
    orderByNeedles
  };
  const result = objectScan(needles, {
    ...kwargs,
    strict: false,
    joined: true,
    filterFn: cb('filterFn'),
    breakFn: cb('breakFn')
  })(haystack);

  const startCompile = process.hrtime();
  const scanner = objectScan(needles, { ...kwargs, strict: false });
  const diffCompile = process.hrtime(startCompile);
  const durationCompile = diffCompile[0] * 1e9 + diffCompile[1];
  const startTraverse = process.hrtime();
  scanner(haystack);
  const diffTraverse = process.hrtime(startTraverse);
  const durationTraverse = diffTraverse[0] * 1e9 + diffTraverse[1];

  let warning = null;
  try {
    objectScan(needles, kwargs);
  } catch (e) {
    warning = e.message;
  }
  return {
    haystack,
    needles,
    kwargs,
    logs,
    warning,
    duration: {
      compile: durationCompile,
      traverse: durationTraverse
    },
    result
  };
};
