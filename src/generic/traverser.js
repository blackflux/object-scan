const traverse = (obj, cb) => {
  const stack = [obj];
  const counts = [1];
  let depth = 0;

  let inc = true;

  while (stack.length !== 0) {
    if (inc === true) {
      const cur = stack[stack.length - 1];
      cb('ENTER', cur, depth);

      const values = Object.values(cur);
      if (values.length !== 0) {
        stack.push(...values);
        depth += 1;
        counts[depth] = values.length;
      } else {
        inc = false;
      }
    } else {
      const cur = stack.pop();
      cb('EXIT', cur, depth);
      counts[depth] -= 1;
      if (counts[depth] === 0) {
        counts.pop();
        depth -= 1;
      } else {
        inc = true;
      }
    }
  }
};
export default { traverse };
