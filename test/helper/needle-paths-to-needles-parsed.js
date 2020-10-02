const findLastIndex = require('./find-last-index');
const simplifyNeedleParsed = require('./simplify-needle-parsed');

const normalizePath = (p) => p.map((e) => [
  e.string ? '' : '[',
  e.exclude ? '!' : '',
  e.value,
  e.string ? '' : ']'
].join(''));

const computeDiff = (a, b) => {
  const startDiff = a.findIndex((e, idx) => b[idx] !== e);
  const lenOffset = b.length - a.length;

  const endDiffA = findLastIndex(a, (e, idx) => b[idx + lenOffset] !== e);
  const endDiffB = findLastIndex(b, (e, idx) => a[idx - lenOffset] !== e);

  if (startDiff === -1 && endDiffA === -1 && endDiffB === -1) {
    return null;
  }

  const lenDiffA = endDiffA - startDiff + 1;
  const lenDiffB = endDiffB - startDiff + 1;

  const overlapTailA = a.length - Math.max(startDiff, endDiffA + 1);
  const overlapTailB = b.length - Math.max(startDiff, endDiffB + 1);

  return {
    a,
    b,
    startDiff,
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
    startDiff,
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
  if (lenDiffA <= 0 || lenDiffB <= 0) {
    if (overlapTailA > 1 && overlapTailB > 1) {
      a.splice(startDiff, a.length - overlapTailA + 1 - startDiff, new Set([
        a.slice(startDiff, a.length - overlapTailA + 1),
        b.slice(startDiff, b.length - overlapTailB + 1)
      ]));
    } else {
      a.splice(startDiff, a.length - startDiff, new Set([
        a.slice(startDiff, a.length),
        b.slice(startDiff, b.length)
      ]));
    }
    return true;
  }
  a.splice(startDiff, lenDiffA, new Set([
    a.slice(startDiff, endDiffA + 1),
    b.slice(startDiff, endDiffB + 1)
  ]));
  return true;
};

const findBestDiff = (haystack, needle) => {
  let result = null;
  let diffSize = Number.MAX_SAFE_INTEGER;

  haystack.forEach((value) => {
    const diff = computeDiff(value, needle);
    if (diff === null) {
      return;
    }

    const diffSizeNew = (diff.lenDiffA + diff.lenDiffB) / 2;
    if (diffSizeNew < diffSize) {
      diffSize = diffSizeNew;
      result = diff;
    }
  });
  return result;
};

module.exports = (paths) => {
  const result = [];
  paths
    .map((p) => normalizePath(p))
    .forEach((p) => {
      if (result.length === 0) {
        result.push(p);
        return;
      }

      const diff = findBestDiff(result, p);
      if (diff === null) {
        return;
      }

      const applied = applyDiff(diff);
      if (applied === false) {
        result.push(diff.b);
      }
    });
  return simplifyNeedleParsed(new Set(result));
};
