const assert = require('assert');
const generateHaystack = require('./generate-haystack');
const generateNeedles = require('./generate-needles');
const generateOptions = require('./generate-options');
const pruneHaystack = require('./prune-haystack');

const boolProbFn = (intervalSize, threshold) => () => {
  const intervalPos = Math.random() * (1 - intervalSize);
  return () => intervalPos + intervalSize * Math.random() < threshold;
};

const intProbFn = (min, max, bias = (x) => x ** 2) => () => {
  const maxIntervalSize = max - min;
  const intervalSize = maxIntervalSize * bias(Math.random());
  const maxIntervalPos = maxIntervalSize - intervalSize;
  const intervalPos = maxIntervalPos * bias(Math.random());
  return () => Math.round(min + intervalPos + intervalSize * Math.random());
};

module.exports = ({
  keySets,
  maxNodes = 500,
  arrayProb = boolProbFn(0.1, 0.2),
  objectLengthProb = intProbFn(0, 30),
  arrayLengthProb = intProbFn(0, 30),
  maxDepthProb = intProbFn(1, 20),
  maxNeedlesProb = intProbFn(1, 20),
  maxNeedleLengthProb = intProbFn(1, 20),
  negateProb = boolProbFn(0.1, 0.2),
  starProb = boolProbFn(0.1, 0.2),
  doubleStarProb = boolProbFn(0.1, 0.2),
  emptyNeedleProb = boolProbFn(0.1, 0.2),
  useArraySelectorProb = boolProbFn(0.1, 0.8),
  partialStarProb = boolProbFn(0.1, 0.2)
}) => {
  assert(
    Array.isArray(keySets)
    && keySets.length > 0
    && keySets.every((keys) => Array.isArray(keys) && keys.length > 0 && keys.every((k) => typeof k === 'string'))
  );
  assert(Number.isInteger(maxNodes) && maxNodes > 0);
  assert(typeof arrayProb === 'function', 'arrayProb');
  assert(typeof objectLengthProb === 'function', 'objectLengthProb');
  assert(typeof arrayLengthProb === 'function', 'arrayLengthProb');
  assert(typeof maxDepthProb === 'function', 'maxDepthProb');
  assert(typeof maxNeedlesProb === 'function', 'maxNeedlesProb');
  assert(typeof maxNeedleLengthProb === 'function', 'maxNeedleLengthProb');
  assert(typeof negateProb === 'function', 'negateProb');
  assert(typeof starProb === 'function', 'starProb');
  assert(typeof doubleStarProb === 'function', 'doubleStarProb');
  assert(typeof emptyNeedleProb === 'function', 'emptyNeedleProb');
  assert(typeof useArraySelectorProb === 'function', 'useArraySelectorProb');
  assert(typeof partialStarProb === 'function', 'partialStarProb');
  const params = {
    keys: keySets[Math.floor(keySets.length * Math.random())],
    maxNodes,
    array: arrayProb(),
    objectLength: objectLengthProb(),
    arrayLength: arrayLengthProb(),
    maxDepth: maxDepthProb(),
    maxNeedles: maxNeedlesProb(),
    maxNeedleLength: maxNeedleLengthProb(),
    negate: negateProb(),
    star: starProb(),
    doubleStar: doubleStarProb(),
    emptyNeedle: emptyNeedleProb(),
    useArraySelector: useArraySelectorProb(),
    partialStar: partialStarProb()
  };
  assert(Array.isArray(params.keys));
  assert(typeof params.array === 'function', 'array');
  assert(typeof params.objectLength === 'function', 'objectLength');
  assert(typeof params.arrayLength === 'function', 'arrayLength');
  assert(typeof params.maxDepth === 'function', 'maxDepth');
  assert(typeof params.maxNeedles === 'function', 'maxNeedles');
  assert(typeof params.maxNeedleLength === 'function', 'maxNeedleLength');
  assert(typeof params.negate === 'function', 'negate');
  assert(typeof params.star === 'function', 'star');
  assert(typeof params.doubleStar === 'function', 'doubleStar');
  assert(typeof params.emptyNeedle === 'function', 'emptyNeedle');
  assert(typeof params.useArraySelector === 'function', 'useArraySelector');
  assert(typeof params.partialStar === 'function', 'partialStar');

  const haystack = generateHaystack(params);
  const opts = generateOptions(params);
  const needles = generateNeedles(haystack, params, opts);

  pruneHaystack(haystack, needles, opts);

  return {
    needles,
    opts,
    haystack
  };
};
