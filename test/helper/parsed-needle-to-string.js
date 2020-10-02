const parsedNeedleToString = (obj) => {
  const isArray = Array.isArray(obj);
  const isSet = obj instanceof Set;
  if (isArray || isSet) {
    const r = (isArray ? obj : [...obj])
      .map((e) => parsedNeedleToString(e))
      .filter((e) => e !== null);
    const len = r.length;
    if (len === 0) {
      return null;
    }
    return `${
      len === 1 ? '' : '{'
    }${r.reduce((prev, next) => {
      if (prev === null) {
        return next;
      }
      if (isSet) {
        return `${prev},${next}`;
      }
      return `${prev}${next.startsWith('[') ? '' : '.'}${next}`;
    }, null)}${
      len === 1 ? '' : '}'
    }`;
  }
  return obj;
};

module.exports = parsedNeedleToString;
