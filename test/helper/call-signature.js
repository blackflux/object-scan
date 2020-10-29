module.exports = ({
  objectScan,
  haystack,
  needles,
  useArraySelector = true
}) => {
  const logs = [];
  const cb = (cbName) => ({
    key,
    value,
    parent,
    parents,
    isMatch,
    matchedBy,
    excludedBy,
    traversedBy,
    isCircular
  }) => {
    logs.push({
      cbName,
      key,
      value,
      parent,
      parents,
      isMatch,
      matchedBy,
      excludedBy,
      traversedBy,
      isCircular
    });
  };
  const result = objectScan(needles, {
    strict: false,
    joined: true,
    useArraySelector,
    filterFn: cb('filterFn'),
    breakFn: cb('breakFn')
  })(haystack);

  const startCompile = process.hrtime();
  const scanner = objectScan(needles, { strict: false, useArraySelector });
  const diffCompile = process.hrtime(startCompile);
  const durationCompile = diffCompile[0] * 1e9 + diffCompile[1];
  const startTraverse = process.hrtime();
  scanner(haystack);
  const diffTraverse = process.hrtime(startTraverse);
  const durationTraverse = diffTraverse[0] * 1e9 + diffTraverse[1];

  let warning = null;
  try {
    objectScan(needles, { useArraySelector });
  } catch (e) {
    warning = e.message;
  }
  return {
    haystack,
    needles,
    useArraySelector,
    logs,
    warning,
    duration: {
      compile: durationCompile,
      traverse: durationTraverse
    },
    result
  };
};
