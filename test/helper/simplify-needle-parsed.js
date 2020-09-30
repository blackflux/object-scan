const simplify = (arg) => {
  if (Array.isArray(arg)) {
    return arg.length === 1 ? simplify(arg[0]) : arg.map((e) => simplify(e));
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
