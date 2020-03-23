const assert = require('assert');
const keysList = require('../resources/keys');
const generateHaystack = require('./generate-haystack');
const generateNeedles = require('./generate-needles');
const pruneHaystack = require('./prune-haystack');

const boolProbFn = (threshold) => () => {
  const chance = Math.random();
  return () => Math.random() * chance > threshold;
};

const intProbFn = (max) => () => {
  const maxValue = Math.ceil((Math.random() ** 2) * max);
  return () => Math.ceil(Math.random() * maxValue);
};

module.exports = ({
  keys = keysList,
  maxNodes = 500,
  arrayProb = boolProbFn(0.5),
  objectLengthProb = intProbFn(50),
  arrayLengthProb = intProbFn(50),
  maxDepthProb = intProbFn(20),
  maxNeedlesProb = intProbFn(20),
  maxNeedleLengthProb = intProbFn(20),
  negateProb = boolProbFn(0.5),
  starProb = boolProbFn(0.5),
  doubleStarProb = boolProbFn(0.5),
  emptyNeedleProb = boolProbFn(0.5)
}) => {
  assert(Array.isArray(keys) && keys.length > 0 && keys.every((k) => typeof k === 'string'));
  assert(Number.isInteger(maxNodes) && maxNodes > 0);
  assert(typeof arrayProb === 'function');
  assert(typeof objectLengthProb === 'function');
  assert(typeof arrayLengthProb === 'function');
  assert(typeof maxDepthProb === 'function');
  assert(typeof maxNeedlesProb === 'function');
  assert(typeof maxNeedleLengthProb === 'function');
  assert(typeof negateProb === 'function');
  assert(typeof starProb === 'function');
  assert(typeof doubleStarProb === 'function');
  assert(typeof emptyNeedleProb === 'function');
  const params = {
    keys,
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
    emptyNeedle: emptyNeedleProb()
  };
  assert(Array.isArray(params.keys));
  assert(typeof params.array === 'function');
  assert(typeof params.objectLength === 'function');
  assert(typeof params.arrayLength === 'function');
  assert(typeof params.maxDepth === 'function');
  assert(typeof params.negate === 'function');
  assert(typeof params.star === 'function');
  assert(typeof params.doubleStar === 'function');
  assert(typeof params.emptyNeedle === 'function');

  const haystack = generateHaystack(params);
  const needles = generateNeedles(haystack, params);

  pruneHaystack(haystack, needles);

  return {
    needles,
    haystack
  };
};
