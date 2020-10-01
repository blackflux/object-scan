const findLastIndex = require('./find-last-index');
const simplifyNeedleParsed = require('./simplify-needle-parsed');

const normalizePath = (p) => p.map((e) => [
  e.string ? '' : '[',
  e.exclude ? '!' : '',
  e.value,
  e.string ? '' : ']'
].join(''));

const findBestMatch = (haystack, needle) => {
  let result = null;
  let diffSize = Number.MAX_SAFE_INTEGER;

  haystack.forEach((value) => {
    const startOverlap = needle.findIndex((e, idx) => value[idx] !== e);
    if (startOverlap === -1) {
      return;
    }
    const lenDiff = value.length - needle.length;

    const endOverlapR = findLastIndex(value, (e, idx) => needle[idx - lenDiff] !== e);
    const endOverlapP = findLastIndex(needle, (e, idx) => value[idx + lenDiff] !== e);

    const diffLengthR = endOverlapR - startOverlap + 1;
    const diffLengthP = endOverlapP - startOverlap + 1;

    const diffSizeNew = (diffLengthR + diffLengthP) / 2;
    if (diffSizeNew < diffSize) {
      diffSize = diffSizeNew;
      result = {
        value,
        startOverlap,
        diffLengthR,
        endOverlapP,
        endOverlapR
      };
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
        value, startOverlap, diffLengthR, endOverlapP, endOverlapR
      } = match;
      if (diffLengthR === value.length) {
        result.push(p);
      } else {
        value.splice(startOverlap, diffLengthR, new Set([
          value.slice(startOverlap, endOverlapR + 1),
          p.slice(startOverlap, endOverlapP + 1)
        ]));
      }
    });
  return simplifyNeedleParsed(new Set(result));
};
