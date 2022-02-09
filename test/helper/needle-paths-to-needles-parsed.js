import assert from 'assert';
import findLastIndex from './find-last-index.js';
import simplifyNeedleParsed from './simplify-needle-parsed.js';

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
    overlapTailB,
    weight: (lenDiffA / (2.0 * a.length)) + (lenDiffB / (2.0 * b.length))
  };
};

const applyDiff = (diff) => {
  if (diff === null) {
    return false;
  }
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

const isExcludeRec = (p) => {
  if (typeof p === 'string') {
    return /^(\[?)!/.test(p);
  }
  if (Array.isArray(p)) {
    return p.some((e) => isExcludeRec(e));
  }
  assert(p instanceof Set);
  return [...p].some((e) => isExcludeRec(e));
};

const findBestDiff = (result) => {
  let diff = null;
  for (let i = 0; i < result.length; i += 1) {
    const a = result[i];
    if (Array.isArray(a)) {
      const isExclude = isExcludeRec(a);
      for (let j = i + 1; j < result.length; j += 1) {
        const b = result[j];
        if (isExclude !== isExcludeRec(b)) {
          break;
        }
        if (Array.isArray(b)) {
          const diffNew = computeDiff(a, b);
          if (diff === null || diffNew.weight < diff.weight) {
            diff = diffNew;
          }
        }
      }
    }
  }
  return diff;
};

const merge = (paths) => {
  const result = [...paths];
  let applied = true;
  while (applied) {
    const diff = findBestDiff(result);
    applied = applyDiff(diff);
    if (applied === true) {
      result.splice(result.indexOf(diff.b), 1);
    }
  }
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

export default (paths) => recurse(new Set(paths.map((p) => normalizePath(p))));
