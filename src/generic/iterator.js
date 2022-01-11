const iterate = (tree, cb) => {
  const stack = [tree];
  const parent = [null];
  const count = [];
  const depth = [];
  const path = [];
  let idx = 0;
  let inc = true;

  while (idx !== -1) {
    const e = stack[idx];
    if (e instanceof Set) {
      stack[idx] = [...e];
      stack[idx].or = true;
    } else if (Array.isArray(e)) {
      if (e.or !== true) {
        stack.splice(idx, 1, ...e);
        parent.splice(idx, 1, ...new Array(e.length).fill(parent[idx]));
        if (parent[idx] !== null) {
          depth[parent[idx]] += e.length - 1;
        }
      } else {
        if (count[idx] === undefined) {
          count[idx] = 0;
          depth[idx] = 0;
        } else if (depth[idx] !== 0) {
          stack.splice(idx + 1, depth[idx]);
          parent.splice(idx + 1, depth[idx]);
          depth[idx] = 0;
        }

        if (count[idx] < e.length) {
          stack.splice(idx + 1, 0, e[count[idx]]);
          parent.splice(idx + 1, 0, idx);
          count[idx] = (count[idx] || 0) + 1;
          depth[idx] += 1;
          inc = true;
          idx += 1;
        } else {
          count[idx] = 0;
          idx -= 1;
        }
      }
    } else if (inc === true) {
      path.push(e);
      cb('ADD', e);
      if (idx === stack.length - 1) {
        cb('FIN', path);
        inc = false;
      } else {
        idx += 1;
      }
    } else {
      cb('RM', path.pop());
      idx -= 1;
    }
  }
};
export default { iterate };
