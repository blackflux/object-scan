import { toPath } from '../generic/helper.js';

const getUniques = (searches, key) => {
  const result = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const search of searches) {
    const needles = search[key];
    // eslint-disable-next-line no-restricted-syntax
    for (const needle of needles) {
      if (!result.includes(needle)) {
        result.push(needle);
      }
    }
  }
  return result;
};

export const matchedBy = (searches) => getUniques(searches, 'leafNeedlesMatch');
export const excludedBy = (searches) => getUniques(searches, 'leafNeedlesExclude');
export const traversedBy = (searches) => getUniques(searches, 'needles');

export const isLastLeafMatch = (searches) => {
  let maxLeafIndex = Number.MIN_SAFE_INTEGER;
  let maxLeaf = null;
  for (let idx = 0, len = searches.length; idx < len; idx += 1) {
    const s = searches[idx];
    const { index } = s;
    if (index !== undefined && index > maxLeafIndex) {
      maxLeafIndex = index;
      maxLeaf = s;
    }
  }
  return maxLeaf !== null && maxLeaf.match === true;
};

export const formatPath = (input, ctx) => (ctx.joined ? toPath(input) : [...input]);
