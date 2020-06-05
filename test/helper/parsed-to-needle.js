const parsedToNeedle = (obj) => {
  if (Array.isArray(obj)) {
    return `{${obj.reduce((p, e) => {
      const parsed = parsedToNeedle(e);
      if (p === null) {
        return parsed;
      }
      return parsed.startsWith('[') ? `${p}${parsed}` : `${p}.${parsed}`;
    }, null)}}`;
  }
  if (obj instanceof Set) {
    return `{${[...obj].map((e) => parsedToNeedle(e)).join(',')}}`;
  }
  return obj;
};

module.exports = parsedToNeedle;
