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
    return result.size === 1 ? result.values().next().value : result;
  }
  return arg;
};

module.exports = simplify;
