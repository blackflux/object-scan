const extractPathsRec = (haystack, path = []) => {
  const result = [];
  if (Array.isArray(haystack)) {
    haystack
      .forEach((value, key) => {
        result.push(...extractPathsRec(value, path.concat(key)));
      });
  } else if (haystack instanceof Object) {
    Object
      .entries(haystack)
      .forEach(([key, value]) => {
        result.push(...extractPathsRec(value, path.concat(key)));
      });
  } else {
    result.push(path);
  }
  return result;
};

export default (haystack) => extractPathsRec(haystack).reverse();
