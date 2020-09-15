const assert = require('assert');

module.exports = (arr, len, rng = Math.random) => {
  assert(Array.isArray(arr) && arr.length !== 0);
  assert(Number.isInteger(len) && len >= 0);
  assert(typeof rng === 'function');

  const available = [];
  const result = [];
  while (result.length < len) {
    if (available.length === 0) {
      available.push(...Array(arr.length).keys());
    }
    const index = Math.floor(rng() * available.length);
    const picked = available.splice(index, 1)[0];
    const char = arr[picked];
    result.push(char);
  }
  return result;
};
