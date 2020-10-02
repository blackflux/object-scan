const findLastIndex = require('./find-last-index');
const simplifyNeedleParsed = require('./simplify-needle-parsed');

const normalizePath = (p) => p.map((e) => [
  e.string ? '' : '[',
  e.exclude ? '!' : '',
  e.value,
  e.string ? '' : ']'
].join(''));

const analyzeDiff = (a, b) => {
  const startDiff = a.findIndex((e, idx) => b[idx] !== e);
  const lenOffset = b.length - a.length;

  const endDiffA = findLastIndex(a, (e, idx) => b[idx + lenOffset] !== e);
  const endDiffB = findLastIndex(b, (e, idx) => a[idx - lenOffset] !== e);

  if (startDiff === -1 && endDiffA === -1 && endDiffB === -1) {
    return null;
  }

  const lenDiffA = endDiffA - startDiff + 1;
  const lenDiffB = endDiffB - startDiff + 1;

  return {
    a,
    b,
    startDiff,
    endDiffA,
    endDiffB,
    lenDiffA,
    lenDiffB
  };
};

const findBestMatch = (haystack, needle) => {
  let result = null;
  let diffSize = Number.MAX_SAFE_INTEGER;

  haystack.forEach((value) => {
    const diff = analyzeDiff(value, needle);
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

      const match = findBestMatch(result, p);
      if (match === null) {
        return;
      }

      const {
        a,
        startDiff,
        endDiffA,
        endDiffB,
        lenDiffA,
        lenDiffB
      } = match;
      if (lenDiffA === a.length) {
        result.push(p);
      } else if (lenDiffA <= 0 || lenDiffB <= 0) {
        a.splice(startDiff, a.length - startDiff, new Set([
          a.slice(startDiff, a.length),
          p.slice(startDiff, p.length)
        ]));
      } else {
        a.splice(startDiff, lenDiffA, new Set([
          a.slice(startDiff, endDiffA + 1),
          p.slice(startDiff, endDiffB + 1)
        ]));
      }
    });
  return simplifyNeedleParsed(new Set(result));
};
