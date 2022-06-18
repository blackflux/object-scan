import { toPath } from '../generic/helper.js';

const getUniques = (searches, key) => {
  const result = [];
  for (let i = 0, lenS = searches.length; i < lenS; i += 1) {
    const needles = searches[i][key];
    for (let j = 0, lenN = needles.length; j < lenN; j += 1) {
      const needle = needles[j];
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
  let maxLeafIndex = -1;
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
