const extractNeedlesRec = (haystack, path = []) => {
  const result = [];
  if (Array.isArray(haystack)) {
    haystack
      .forEach((value, key) => {
        result.push(...extractNeedlesRec(value, path.concat(key)));
      });
  } else if (haystack instanceof Object) {
    Object
      .entries(haystack)
      .forEach(([key, value]) => {
        result.push(...extractNeedlesRec(value, path.concat(key)));
      });
  } else {
    result.push(path);
  }
  return result;
};

module.exports = (haystack) => extractNeedlesRec(haystack);
