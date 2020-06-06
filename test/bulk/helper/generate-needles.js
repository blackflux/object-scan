const assert = require('assert');
const get = require('lodash.get');
const objectScan = require('../../../src');
const { escape } = require('../../../src/util/helper');


const generateNeedle = (haystack, {
  maxNeedleLength,
  negate,
  star,
  doubleStar,
  partialStar,
  questionMark
}, opts) => {
  assert(typeof maxNeedleLength === 'function');
  assert(typeof negate === 'function');
  assert(typeof star === 'function');
  assert(typeof doubleStar === 'function');
  assert(typeof partialStar === 'function');
  assert(typeof questionMark === 'function');
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
    if (star() === true) {
      return p.concat(Number.isInteger(segment) ? '[*]' : '*');
    }
    let modSegment = String(segment);
    if (partialStar() === true) {
      const replaceLength = Math.floor(modSegment.length * Math.random());
      const replaceStart = Math.round(Math.random() * (modSegment.length - replaceLength));
      modSegment = [
        escape(modSegment.substr(0, replaceStart)),
        '*',
        escape(modSegment.substr(replaceStart + replaceLength))
      ].join('');
    } else if (questionMark() === true) {
      const pos = Math.floor(Math.random() * modSegment.length);
      modSegment = [
        escape(modSegment.substr(0, pos)),
        '?',
        escape(modSegment.substr(pos + 1))
      ].join('');
    } else {
      modSegment = escape(modSegment);
    }
    return p.concat(Number.isInteger(segment) ? `[${modSegment}]` : modSegment);
  }, []);
  if (result.length === 0) {
    return '';
  }
  return `${negate() === true ? '!' : ''}${result
    .reduce((p, c) => {
      if (c.startsWith('[')) {
        return `${p}${c}`;
      }
      return p === '' ? c : `${p}.${c}`;
    }, '')}`;
};

const generateNeedles = (haystack, params, opts) => {
  const {
    maxNeedles,
    emptyNeedle
  } = params;
  assert(typeof maxNeedles === 'function');
  assert(typeof emptyNeedle === 'function');
  const r = [...new Set([...Array(maxNeedles())].map(() => generateNeedle(haystack, params, opts)))];
  if (emptyNeedle()) {
    r[Math.floor(Math.random() * r.length)] = '';
  }
  return r;
};

module.exports = generateNeedles;
