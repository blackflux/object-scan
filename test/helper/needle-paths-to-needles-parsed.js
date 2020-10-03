const assert = require('assert');
const findLastIndex = require('./find-last-index');
const simplifyNeedleParsed = require('./simplify-needle-parsed');

const normalizePath = (p) => p.map((e) => [
  e.string ? '' : '[',
  e.exclude ? '!' : '',
  e.value,
  e.string ? '' : ']'
].join(''));

const computeDiff = (a, b) => {
  const lenOffset = b.length - a.length;

  const sdA = a.findIndex((e, idx) => b[idx] !== e);
  const sdB = b.findIndex((e, idx) => a[idx] !== e);

  const edA = findLastIndex(a, (e, idx) => b[idx + lenOffset] !== e || sdA + Math.max(0, -lenOffset) > idx);
  const edB = findLastIndex(b, (e, idx) => a[idx - lenOffset] !== e || sdB + Math.max(0, lenOffset) > idx);

  const startDiffA = sdA === -1 ? a.length : sdA;
  const startDiffB = sdB === -1 ? b.length : sdB;

  const endDiffA = Math.max(startDiffA - 1, edA);
  const endDiffB = Math.max(startDiffB - 1, edB);

  const lenDiffA = endDiffA - startDiffA + 1;
  const lenDiffB = endDiffB - startDiffB + 1;

  const overlapTailA = a.length - 1 - endDiffA;
  const overlapTailB = b.length - 1 - endDiffB;

  return {
    a,
    b,
    startDiffA,
    startDiffB,
    endDiffA,
    endDiffB,
    lenDiffA,
    lenDiffB,
    overlapTailA,
    overlapTailB
  };
};

const applyDiff = (diff) => {
  const {
    a,
    b,
    startDiffA,
    startDiffB,
    endDiffA,
    endDiffB,
    lenDiffA,
    lenDiffB,
    overlapTailA,
    overlapTailB
  } = diff;
  if (lenDiffA === a.length) {
    return false;
  }
  assert(a.length > 1 && b.length > 1);
  if (lenDiffA === 0 || lenDiffB === 0) {
    if (
      (overlapTailA >= 1 && overlapTailB >= 1 && startDiffA >= 1 && startDiffB >= 1)
      || (overlapTailA > 1 && overlapTailB > 1)
    ) {
      a.splice(startDiffA, a.length - overlapTailA + 1 - startDiffA, new Set([
        a.slice(startDiffA, a.length - overlapTailA + 1),
        b.slice(startDiffB, b.length - overlapTailB + 1)
      ]));
    } else {
      assert(startDiffA > 1 && startDiffB > 1);
      a.splice(startDiffA - 1, a.length - (startDiffA - 1), new Set([
        a.slice(startDiffA - 1, a.length),
        b.slice(startDiffB - 1, b.length)
      ]));
    }
    return true;
  }
  a.splice(startDiffA, lenDiffA, new Set([
    a.slice(startDiffA, endDiffA + 1),
    b.slice(startDiffB, endDiffB + 1)
  ]));
  return true;
};

const findBestDiff = (haystack, needle) => {
  if (!Array.isArray(needle)) {
    return null;
  }

  let result = null;
  let diffSize = Number.MAX_SAFE_INTEGER;

  const hs = haystack.filter((value) => Array.isArray(value));
  for (let idx = 0; idx < hs.length; idx += 1) {
    const value = hs[idx];

    const diff = computeDiff(value, needle);
    const diffSizeNew = (diff.lenDiffA + diff.lenDiffB) / 2;
    if (diffSizeNew < diffSize) {
      diffSize = diffSizeNew;
      result = diff;
    }
  }
  return result;
};

const merge = (paths) => {
  const result = [];
  paths
    .forEach((p) => {
      const diff = findBestDiff(result, p);
      if (diff === null) {
        result.push(p);
        return;
      }

      const applied = applyDiff(diff);
      if (applied === false) {
        result.push(diff.b);
      }
    });
  return result;
};

const recurse = (obj_) => {
  const obj = simplifyNeedleParsed(obj_);
  if (obj instanceof Set) {
    return new Set(merge([...obj]).map((e) => recurse(e)));
  }
  if (Array.isArray(obj)) {
    return obj.map((e) => recurse(e));
  }
  return obj;
};

module.exports = (paths) => recurse(new Set(paths.map((p) => normalizePath(p))));
