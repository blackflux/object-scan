const simplify = (arg) => {
  if (Array.isArray(arg)) {
    const result = [];
    arg.forEach((ele_) => {
      const ele = simplify(ele_);
      if (Array.isArray(ele)) {
        result.push(...ele);
      } else {
        result.push(ele);
      }
    });
    return result.length === 1 ? result[0] : result;
  }
  if (arg instanceof Set) {
    const result = new Set();
    arg.forEach((ele_) => {
      const ele = simplify(ele_);
      if (ele instanceof Set) {
        ele.forEach((e) => result.add(e));
      } else {
        result.add(ele);
      }
    });
    if (result.size === 1) {
      const value = result.values().next().value;
      if (!Array.isArray(value) || value.length !== 0) {
        return value;
      }
    }
    return result;
  }
  return arg;
};

module.exports = simplify;
