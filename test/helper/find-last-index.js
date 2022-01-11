export default (array, predicate) => {
  for (let idx = array.length - 1; idx >= 0; idx -= 1) {
    const x = array[idx];
    if (predicate(x, idx)) {
      return idx;
    }
  }
  return -1;
};
