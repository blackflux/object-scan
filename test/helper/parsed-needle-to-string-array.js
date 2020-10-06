const parsedNeedleToStringArray = (obj, depth = 0) => {
  const isArray = Array.isArray(obj);
  const isSet = obj instanceof Set;
  if (isArray || isSet) {
    const r = (isArray ? obj : [...obj])
      .map((e) => parsedNeedleToStringArray(e, depth + 1));
    const len = r.length;
    if (len === 0) {
      return depth === 0 ? [] : '';
    }
    if (isSet && depth === 0) {
      return r;
    }
    const pullExcludeOut = !isArray
      && depth !== 0
      && r.length > 1
      && r.every((e) => e.startsWith('!') || e.startsWith('[!'));
    const str = r.reduce((prev, next_) => {
      const next = pullExcludeOut ? next_.replace(/^(\[?)!/, '$1') : next_;
      if (prev === null) {
        return next;
      }
      if (isSet) {
        return `${prev},${next}`;
      }
      return `${prev}${next.startsWith('[') ? '' : '.'}${next}`;
    }, null);
    if (depth === 0) {
      return [str];
    }
    const asBlank = isArray || len === 1;
    return [
      pullExcludeOut ? '!' : '',
      asBlank ? '' : '{',
      str,
      asBlank ? '' : '}'
    ].join('');
  }
  return depth === 0 ? [obj] : obj;
};

module.exports = (obj) => parsedNeedleToStringArray(obj);
