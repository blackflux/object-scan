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
  if (startDiff === -1) {
    return null;
  }
  const lenOffset = b.length - a.length;

  const endDiffA = findLastIndex(a, (e, idx) => b[idx + lenOffset] !== e);
  const endDiffB = findLastIndex(b, (e, idx) => a[idx - lenOffset] !== e);

  const lenDiffA = endDiffA - startDiff + 1;
  const lenDiffB = endDiffB - startDiff + 1;

  return {
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
      result = { ...diff, value };
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
        value,
        startDiff,
        endDiffA,
        endDiffB,
        lenDiffA,
        lenDiffB
      } = match;
      if (lenDiffA === value.length) {
        result.push(p);
      } else if (lenDiffA <= 0 || lenDiffB <= 0) {
        value.splice(startDiff, value.length - startDiff, new Set([
          value.slice(startDiff, value.length),
          p.slice(startDiff, p.length)
        ]));
      } else {
        value.splice(startDiff, lenDiffA, new Set([
          value.slice(startDiff, endDiffA + 1),
          p.slice(startDiff, endDiffB + 1)
        ]));
      }
    });
  return simplifyNeedleParsed(new Set(result));
};
