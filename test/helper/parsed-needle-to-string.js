const parsedNeedleToString = (obj) => {
  if (Array.isArray(obj)) {
    return `{${obj.reduce((p, e) => {
      const parsed = parsedNeedleToString(e);
      if (p === null) {
        return parsed;
      }
      return parsed.startsWith('[') ? `${p}${parsed}` : `${p}.${parsed}`;
    }, null)}}`;
  }
  if (obj instanceof Set) {
    return `{${[...obj].map((e) => parsedNeedleToString(e)).join(',')}}`;
  }
  return obj;
};

module.exports = parsedNeedleToString;
