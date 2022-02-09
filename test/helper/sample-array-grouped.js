import sampleArray from './sample-array.js';

export default (...args) => {
  const indicesGrouped = {};
  sampleArray(...args).forEach((idx) => {
    if (indicesGrouped[idx] === undefined) {
      indicesGrouped[idx] = 0;
    }
    indicesGrouped[idx] += 1;
  });
  return Object
    .entries(indicesGrouped)
    .map(([k, v]) => [parseInt(k, 10), v])
    .sort((a, b) => b[0] - a[0]);
};
