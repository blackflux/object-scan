import { toPath } from '../generic/helper.js';

export const matchedBy = (searches) => Array
  .from(new Set(searches.flatMap(({ leafNeedlesMatch }) => leafNeedlesMatch)));
export const excludedBy = (searches) => Array
  .from(new Set(searches.flatMap(({ leafNeedlesExclude }) => leafNeedlesExclude)));
export const traversedBy = (searches) => Array
  .from(new Set(searches.flatMap(({ needles }) => needles)));

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
