module.exports.traverse = (obj, cb) => {
  const stack = [obj];
  const depth = [0];

  let inc = true;

  while (stack.length !== 0) {
    if (inc === true) {
      const cur = stack[stack.length - 1];
      const curDepth = depth[depth.length - 1];
      const values = Object.values(cur);
      if (values.length !== 0) {
        const d = curDepth + 1;
        values.forEach((e) => {
          stack.push(e);
          depth.push(d);
        });
      } else {
        inc = false;
      }
      cb('ENTER', cur, curDepth);
    } else {
      const cur = stack.pop();
      const curDepth = depth.pop();
      if (curDepth === depth[depth.length - 1]) {
        inc = true;
      }
      cb('EXIT', cur, curDepth);
    }
  }
};
