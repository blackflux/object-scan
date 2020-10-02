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
    const startDiff = needle.findIndex((e, idx) => value[idx] !== e);
    if (startDiff === -1) {
      return;
    }
    const lenOffset = value.length - needle.length;

    const endDiffV = findLastIndex(value, (e, idx) => needle[idx - lenOffset] !== e);
    const endDiffP = findLastIndex(needle, (e, idx) => value[idx + lenOffset] !== e);

    const lenDiffV = endDiffV - startDiff + 1;
    const lenDiffP = endDiffP - startDiff + 1;

    const diffSizeNew = (lenDiffV + lenDiffP) / 2;
    if (diffSizeNew < diffSize) {
      diffSize = diffSizeNew;
      result = {
        value,
        startDiff,
        endDiffV,
        endDiffP,
        lenDiffV,
        lenDiffP
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
        value,
        startDiff,
        endDiffV,
        endDiffP,
        lenDiffV,
        lenDiffP
      } = match;
      if (lenDiffV === value.length) {
        result.push(p);
      } else if (lenDiffV <= 0 || lenDiffP <= 0) {
        value.splice(startDiff, value.length - startDiff, new Set([
          value.slice(startDiff, value.length),
          p.slice(startDiff, p.length)
        ]));
      } else {
        value.splice(startDiff, lenDiffV, new Set([
          value.slice(startDiff, endDiffV + 1),
          p.slice(startDiff, endDiffP + 1)
        ]));
      }
    });
  return simplifyNeedleParsed(new Set(result));
};
