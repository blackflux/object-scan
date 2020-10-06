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
  return {
    haystack,
    needles,
    logs,
    result
  };
};
