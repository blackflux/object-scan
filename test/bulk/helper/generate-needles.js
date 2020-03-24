const assert = require('assert');
const get = require('lodash.get');
const objectScan = require('../../../src');
const { escape } = require('../../../src/util/helper');


const generateNeedle = (haystack, {
  maxNeedleLength,
  negate,
  star,
  doubleStar,
  emptyNeedle
}) => {
  assert(typeof maxNeedleLength === 'function');
  assert(typeof negate === 'function');
  assert(typeof star === 'function');
  assert(typeof doubleStar === 'function');
  assert(typeof emptyNeedle === 'function');
  if (emptyNeedle()) {
    return '';
  }
  const length = maxNeedleLength();
  let root = haystack;
  const result = [...Array(length)].reduce((p) => {
    if (!(root instanceof Object) || Object.keys(root).length === 0) {
      return p;
    }
    let key;
    if (doubleStar() === true) {
      key = '**';
    } else if (star() === true) {
      key = Array.isArray(root) ? '[*]' : '*';
    } else {
      key = Array.isArray(root)
        ? Math.floor(root.length * Math.random())
        : escape(Object.keys(root)[Math.floor(Object.keys(root).length * Math.random())]);
    }
    const nexts = objectScan([typeof key === 'number' ? `[${key}]` : key])(root);
    const next = nexts[Math.floor(Math.random() * nexts.length)];
    root = get(root, next);
    return p.concat(key);
  }, []);
  if (result.length === 0) {
    return '';
  }
  return `${negate() === true ? '!' : ''}${result
    .reduce((p, c) => {
      if (typeof c === 'number') {
        return `${p}[${c}]`;
      }
      if (c === '[*]') {
        return `${p}${c}`;
      }
      return p === '' ? c : `${p}.${c}`;
    }, '')}`;
};

const generateNeedles = (haystack, params) => {
  const {
    maxNeedles
  } = params;
  assert(typeof maxNeedles === 'function');
  return [...new Set([...Array(maxNeedles())].map(() => generateNeedle(haystack, params)))];
};

module.exports = generateNeedles;
