const pathsEqual = (p1, p2) => {
  if (p1.length !== p2.length) {
    return false;
  }
  return p1.every((k, idx) => k === p2[idx]);
};

module.exports = (paths) => {
  const result = [];
  paths
    .map((p) => p.filter((k) => !Number.isInteger(k)))
    .forEach((p) => {
      for (let idx = 0; idx < result.length; idx += 1) {
        if (pathsEqual(result[idx], p)) {
          return;
        }
      }
      result.push(p);
    });
  return result;
};
