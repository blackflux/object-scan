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
  let idx = searches.length;
  // eslint-disable-next-line no-plusplus
  while (idx--) {
    const s = searches[idx];
    const { index } = s;
    if (index > maxLeafIndex) {
      maxLeafIndex = index;
      maxLeaf = s;
    }
  }
  return maxLeaf?.match === true;
};

export const formatPath = (input, ctx) => (ctx.joined ? toPath(input) : [...input]);
