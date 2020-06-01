const assert = require('assert');

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

class OrArray extends Array {
  next() {
    if (this.idx === undefined) {
      this.idx = 0;
    }
    if (this.idx < this.length) {
      this.idx += 1;
      return this[this.idx - 1];
    }
    return null;
  }

  reset() {
    this.idx = 0;
  }

  set offset(value) {
    this._offset = value;
  }

  get offset() {
    return this._offset || 0;
  }
}

const iter = (input) => {
  const result = [];

  const stack = [input];
  let cOr = new OrArray();
  let idx = 0;

  let inc = true;
  const path = [];

  while (inc === true || idx >= 0) {
    // console.log('S', idx, inc, stack);

    const obj = stack[idx];
    if (obj instanceof Set) {
      cOr = new OrArray(...obj);
      stack[idx] = cOr;
      inc = true;
    } else if (obj instanceof OrArray) {
      const next = obj.next();
      if (next === null) {
        cOr = null;
        obj.reset();
        idx -= 1;
        inc = false;
      } else {
        cOr = obj;
        const offset = stack.slice(idx, cOr.offset).reduce((p, c) => p + (c.offset || 0), 0);
        stack.splice(idx + 1, offset, next);
        cOr.offset = 1;
        inc = true;
        idx += 1;
      }
    } else if (Array.isArray(obj)) {
      stack.splice(idx, 1, ...obj);
      cOr.offset += obj.length - 1;
      inc = true;
    } else {
      if (inc === true) {
        path.push(obj);
        if (stack.length === idx + 1) {
          result.push(path.join('.'));
          path.pop();
          inc = false;
          idx -= 1;
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

const iter2 = (obj) => {
  const result = [];
  const stack = [[[], obj]];

  while (stack.length !== 0) {
    const [path, cur] = stack.pop();
    if (cur.length === 0) {
      result.push(path.join('.'));
    } else {
      const [next, ...further] = cur;
      if (Array.isArray(next)) {
        stack.push([path, next.concat(further)]);
      } else if (next instanceof Set) {
        [...next].reverse().forEach((e) => {
          stack.push([path, [e, further]]);
        });
      } else {
        stack.push([path.concat(cur[0]), cur.slice(1)]);
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

for (let idx = 0; idx < 1000; idx += 1) {
  const data = [rand()];
  const r1 = rec(data);
  const r2 = iter2(data);

  if (r1.length !== r2.length || r1.some((e, i) => e !== r2[i])) {
    console.log(idx);
    console.log(visualize(data));
    console.log(JSON.stringify(r1));
    console.log(JSON.stringify(r2));
    throw Error('Result Mismatch');
  }
}

const bench = (name, fnRaw, count = 1000) => {
  const fn = fnRaw();
  for (let i = 0; i < count * 10; i += 1) {
    fn();
  }
  console.time(name);
  for (let i = 0; i < count; i += 1) {
    fn();
  }
  console.timeEnd(name);
};

bench('rec', () => () => {
  const d = [rand()];
  rec(d);
});
bench('iter', () => () => {
  const d = [rand()];
  iter2(d);
});
