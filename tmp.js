const rec = (obj, path = []) => {
  if (obj.length === 0) {
    return [path.join('.')];
  }
  if (Array.isArray(obj[0])) {
    return rec([...obj[0], ...obj.slice(1)], path);
  }
  if (obj[0] instanceof Set) {
    const result = [];
    obj[0].forEach((e) => {
      result.push(...rec([e, ...obj.slice(1)], path));
    });
    return result;
  }
  return rec(obj.slice(1), path.concat(obj[0]));
};

const iter = (obj) => {
  const result = [];

  const stack = [obj];
  const count = [];
  const depth = [0];
  const path = [];
  let idx = 0;
  let inc = true;

  while (idx >= 0) {
    const e = stack[idx];
    if (Array.isArray(e)) {
      stack.splice(idx, 1, ...e);
      depth.splice(idx, 1, ...new Array(e.length).fill(depth[idx]));
    } else if (e instanceof Set) {
      while (depth[idx + 1] !== undefined && depth[idx + 1] > depth[idx]) {
        depth.splice(idx + 1, 1);
        stack.splice(idx + 1, 1);
      }

      const eArray = [...e];
      if (count[idx] === undefined) {
        count[idx] = 0;
      }
      if (count[idx] < eArray.length) {
        stack.splice(idx + 1, 0, eArray[count[idx]]);
        depth.splice(idx + 1, 0, depth[idx] + 1);
        count[idx] = (count[idx] || 0) + 1;
        inc = true;
        idx += 1;
      } else {
        count[idx] = 0;
        inc = false;
        idx -= 1;
      }
    } else {
      if (inc === true) {
        path.push(e);
        if (idx === stack.length - 1) {
          result.push(path.join('.'));
          inc = false;
        } else {
          idx += 1;
        }
      } else {
        path.pop();
        idx -= 1;
      }
    }
  }

  return result;
};


const rand = (() => {
  const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  const MAX_DEPTH = 4;
  const MAX_WIDTH = 4;

  let index = 0;
  return (depth = 0) => {
    if (depth === 0) {
      index = 0;
    }
    if (!(index < CHARS.length) || Math.random() * MAX_DEPTH < depth) {
      index += 1;
      return CHARS[(index - 1) % CHARS.length];
    }
    const result = Math.random() > 0.5 ? new Set() : [];
    for (let idx = 0, len = Math.ceil(Math.random() * MAX_WIDTH); idx < len; idx += 1) {
      const entry = rand(depth + 1);
      result[Array.isArray(result) ? 'push' : 'add'](entry);
    }
    return result;
  };
})();

const visualize = (obj) => {
  if (Array.isArray(obj)) {
    return `[${obj.map((e) => visualize(e)).join(',')}]`;
  }
  if (obj instanceof Set) {
    return `{${[...obj].map((e) => visualize(e)).join(',')}}`;
  }
  return obj;
};

for (let idx = 0; idx < 100000; idx += 1) {
  const data = [rand()];
  const r1 = rec(data);
  const r2 = iter(data);

  if (r1.length !== r2.length || r1.some((e, i) => e !== r2[i])) {
    console.log(idx);
    console.log(visualize(data));
    console.log(JSON.stringify(r1));
    console.log(JSON.stringify(r2));
    throw Error('Result Mismatch');
  }
}

// const bench = (name, fnRaw, count = 1000) => {
//   const fn = fnRaw();
//   for (let i = 0; i < count * 10; i += 1) {
//     fn();
//   }
//   console.time(name);
//   for (let i = 0; i < count; i += 1) {
//     fn();
//   }
//   console.timeEnd(name);
// };
//
// bench('rec', () => () => {
//   const d = [rand()];
//   rec(d);
// });
// bench('iter', () => () => {
//   const d = [rand()];
//   iter(d);
// });
