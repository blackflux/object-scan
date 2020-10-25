const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('../../src/index');

describe('Testing mutation logic', () => {
  let haystack;
  let remove;
  let replace;
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
});
