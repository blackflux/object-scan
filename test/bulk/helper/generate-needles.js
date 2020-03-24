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
}, opts) => {
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
    const mkDoubleStar = doubleStar();
    const nexts = objectScan(
      mkDoubleStar === true
        ? ['**']
        : [Array.isArray(root) && opts.useArraySelector !== false ? '[*]' : '*'],
      opts
    )(root);
    if (nexts.length === 0) {
      return p;
    }
    const next = nexts[Math.floor(Math.random() * nexts.length)];
    if (mkDoubleStar === true) {
      root = get(root, next);
      return p.concat('**');
    }
    const segment = next[next.length - 1];
    if (opts.useArraySelector === false && Number.isInteger(segment)) {
      return p;
    }
    root = get(root, next);
    return star() === true
      ? p.concat(Number.isInteger(segment) ? '[*]' : '*')
      : p.concat(Number.isInteger(segment) ? segment : escape(segment));
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

const generateNeedles = (haystack, params, opts) => {
  const {
    maxNeedles
  } = params;
  assert(typeof maxNeedles === 'function');
  return [...new Set([...Array(maxNeedles())].map(() => generateNeedle(haystack, params, opts)))];
};

module.exports = generateNeedles;
