import { describe } from 'node-tdd';
import { expect } from 'chai';
import objectScan from '../../src/index.js';

describe('Testing mutation logic', () => {
  let haystack;
  let remove;
  let replace;
  let pruneCircular;
  beforeEach(() => {
    haystack = { a: { b: [0, 1, 2] }, d: 3, e: 4 };
    remove = (values, data) => objectScan(['**'], {
      rtn: 'count',
      filterFn: ({ parent, property, value }) => {
        if (values.includes(value)) {
          if (typeof property === 'number') {
            parent.splice(property, 1);
          } else {
            // eslint-disable-next-line no-param-reassign
            delete parent[property];
          }
          return true;
        }
        return false;
      }
    })(data);
    replace = (tasks, data) => objectScan(['**'], {
      rtn: 'count',
      filterFn: ({ parent, property, value }) => {
        if (value in tasks) {
          if (typeof property === 'number') {
            parent.splice(property, 1, tasks[value]);
          } else {
            // eslint-disable-next-line no-param-reassign
            parent[property] = tasks[value];
          }
          return true;
        }
        return false;
      }
    })(data);
    pruneCircular = (data) => objectScan(['**'], {
      rtn: 'count',
      filterFn: ({ isCircular, parent, property }) => {
        if (isCircular) {
          if (Array.isArray(parent)) {
            parent.splice(property, 1);
          } else {
            // eslint-disable-next-line no-param-reassign
            delete parent[property];
          }
          return true;
        }
        return false;
      },
      breakFn: ({ isCircular }) => isCircular === true
    })(data);
  });

  it('Testing Remove By Value', () => {
    const r = remove([0, 3], haystack);
    expect(r).to.equal(2);
    expect(haystack).to.deep.equal({ a: { b: [1, 2] }, e: 4 });
  });

  it('Testing Replace By Value', () => {
    const r = replace({ 0: 'x1', 3: 'x2' }, haystack);
    expect(r).to.equal(2);
    expect(haystack).to.deep.equal({ a: { b: ['x1', 1, 2] }, d: 'x2', e: 4 });
  });

  it('Testing Remove Circular', () => {
    const obj = { a: 'foo', c: [0] };
    obj.b = obj;
    obj.c.push(obj);
    expect(() => JSON.stringify(obj)).to.throw('Converting circular structure to JSON');
    const r = pruneCircular(obj);
    expect(r).to.equal(2);
    expect(obj).to.deep.equal({ a: 'foo', c: [0] });
    expect(JSON.stringify(obj)).to.equal('{"a":"foo","c":[0]}');
  });
});
