const parsedNeedleToStringArray = (obj, depth = 0) => {
  const isArray = Array.isArray(obj);
  const isSet = obj instanceof Set;
  if (isArray || isSet) {
    const r = (isArray ? obj : [...obj])
      .map((e) => parsedNeedleToStringArray(e, depth + 1))
      .filter((e) => !Array.isArray(e) || e.length !== 0);
    const len = r.length;
    if (len === 0) {
      return depth === 0 ? [] : '';
    }
    if (isSet && depth === 0) {
      return r;
    }
    return `${
      isArray || len === 1 ? '' : '{'
    }${r.reduce((prev, next) => {
      if (prev === null) {
        return next;
      }
      if (isSet) {
        return `${prev},${next}`;
      }
      return `${prev}${next.startsWith('[') ? '' : '.'}${next}`;
    }, null)}${
      isArray || len === 1 ? '' : '}'
    }`;
  }
  return obj;
};

module.exports = (obj) => {
  // todo: can we improve this ?
  const r = parsedNeedleToStringArray(obj);
  if (!Array.isArray(r)) {
    return [r];
  }
  return r;
};
