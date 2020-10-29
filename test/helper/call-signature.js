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
  const scanner = objectScan(needles, {
    strict: false,
    joined: true,
    useArraySelector,
    filterFn: cb('filterFn'),
    breakFn: cb('breakFn')
  });
  const start = process.hrtime();
  const result = scanner(haystack);
  const diff = process.hrtime(start);
  const duration = diff[0] * 1e9 + diff[1];
  let warning = null;
  try {
    objectScan(needles);
  } catch (e) {
    warning = e.message;
  }
  return {
    haystack,
    needles,
    useArraySelector,
    logs,
    warning,
    duration,
    result
  };
};
