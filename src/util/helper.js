module.exports.defineProperty = (target, k, v) => Object.defineProperty(target, k, { value: v, writable: false });

module.exports.findLast = (array, fn) => {
  for (let idx = array.length - 1; idx >= 0; idx -= 1) {
    const item = array[idx];
    if (fn(item)) {
      return item;
    }
  }
  return undefined;
};
