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
  const parent = [-1];
  const count = [];
  const depth = [];
  const path = [];
  let idx = 0;
  let inc = true;

  while (idx >= 0) {
    const e = stack[idx];
    if (e instanceof Set) {
      stack[idx] = [...e];
      stack[idx].or = true;
    } else if (Array.isArray(e)) {
      if (e.or !== true) {
        stack.splice(idx, 1, ...e);
        parent.splice(idx, 1, ...new Array(e.length).fill(parent[idx]));
        depth[parent[idx]] += e.length - 1;
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
          inc = false;
          idx -= 1;
        }
      }
    } else if (inc === true) {
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

const bench = (name, fnRaw, fnData, count = 10000) => {
  const fn = fnRaw();
  for (let i = 0; i < Math.min(count * 10, 10000); i += 1) {
    fn(fnData());
  }
  const data = (new Array(count)).fill(1).map(() => fnData());
  console.time(name);
  for (let i = 0; i < count; i += 1) {
    fn(data[i]);
  }
  console.timeEnd(name);
};

bench('rec', () => (d) => rec(d), () => [rand()]);
bench('iter', (d) => () => iter(d), () => [rand()]);
