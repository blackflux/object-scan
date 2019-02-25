const assert = require('assert');

module.exports = (a, b) => {
  const lenDiff = b.length - a.length;
  if (lenDiff !== 0) {
    return lenDiff;
  }
  const diffIndex = new Array(a.length).findIndex((_, idx) => a[idx] !== b[idx]);
  assert(diffIndex !== -1, 'Entries not Unique!');
  const bEle = b[diffIndex];
  const aEle = a[diffIndex];
  if (typeof bEle === 'number' && typeof aEle === 'number') {
    return bEle - aEle;
  }
  return String(bEle).localeCompare(String(aEle));
};
