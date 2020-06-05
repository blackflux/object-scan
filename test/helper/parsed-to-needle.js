const parsedToNeedle = (obj) => {
  if (Array.isArray(obj)) {
    return `{${obj.map((e) => parsedToNeedle(e)).join('.')}}`;
  }
  if (obj instanceof Set) {
    return `{${[...obj].map((e) => parsedToNeedle(e)).join(',')}}`;
  }
  return obj;
};

module.exports = parsedToNeedle;
