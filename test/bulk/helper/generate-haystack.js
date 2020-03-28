const assert = require('assert');
const sampleSize = require('lodash.samplesize');

const generateHaystackRec = (params, depth = 0) => {
  const {
    keys,
    maxNodes,
    array,
    arrayLength,
    objectLength,
    maxDepth,
    count
  } = params;
  if (count > maxNodes || depth > maxDepth()) {
    Object.assign(params, { count: count + 1 });
    return count;
  }
  if (array() === false) {
    return (typeof keys === 'function' ? keys(objectLength()) : sampleSize(keys, objectLength()))
      .reduce((p, c) => Object.assign(p, {
        [c]: generateHaystackRec(params, depth + 1)
      }), {});
  }
  return [...Array(arrayLength())]
    .map(() => generateHaystackRec(params, depth + 1));
};

module.exports = (params) => {
  assert(
    (Array.isArray(params.keys) && params.keys.length > 0 && params.keys.every((k) => typeof k === 'string'))
    || typeof params.keys === 'function'
  );
  assert(typeof params.array === 'function');
  assert(typeof params.arrayLength === 'function');
  assert(typeof params.objectLength === 'function');
  assert(typeof params.maxDepth === 'function');
  assert(typeof params.maxDepth === 'function');
  return generateHaystackRec({
    ...params,
    depth: 0,
    count: 0
  });
};
