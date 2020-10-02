const parsedNeedleToString = (obj) => {
  if (Array.isArray(obj)) {
    const len = obj.length;
    if (len === 0) {
      return null;
    }
    return `${
      len === 1 ? '' : '{'
    }${obj.reduce((p, e) => {
      const parsed = parsedNeedleToString(e);
      if (p === null) {
        return parsed;
      }
      return parsed.startsWith('[') ? `${p}${parsed}` : `${p}.${parsed}`;
    }, null)}${
      len === 1 ? '' : '}'
    }`;
  }
  if (obj instanceof Set) {
    const size = obj.size;
    if (size === 0) {
      return null;
    }
    return `${
      size === 1 ? '' : '{'
    }${
      [...obj].map((e) => parsedNeedleToString(e)).join(',')
    }${
      size === 1 ? '' : '}'
    }`;
  }
  return obj;
};

module.exports = parsedNeedleToString;
