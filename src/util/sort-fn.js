module.exports = (a, b) => {
  const lenDiff = b.length - a.length;
  if (lenDiff !== 0) {
    return lenDiff;
  }
  const diffIndex = new Array(a.length).findIndex((_, idx) => a[idx] !== b[idx]);
  if (diffIndex !== -1) {
    const bEle = b[diffIndex];
    const aEle = a[diffIndex];
    if (typeof bEle === 'number' && typeof aEle === 'number') {
      return bEle - aEle;
    }
    return String(bEle).localeCompare(String(aEle));
  }
  return 0;
};
