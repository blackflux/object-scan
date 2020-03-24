const assert = require('assert');
const objectScan = require('../../../src');

const traversed = Symbol('traversed');
const markNode = (node) => {
  if (node instanceof Object) {
    Object.defineProperty(node, traversed, { value: true, writable: true });
  }
};
const isMarked = (node) => node[traversed] === true;

const maxValueRec = (haystack) => {
  if (Number.isInteger(haystack)) {
    return haystack;
  }
  return Object
    .values(haystack)
    .reduce((p, e) => Math.max(p, maxValueRec(e)), 0);
};

const pruneHaystackRec = (haystack) => {
  if (!(haystack instanceof Object)) {
    return;
  }
  if (isMarked(haystack)) {
    Object.values(haystack).forEach((e) => pruneHaystackRec(e));
  } else {
    Object.entries(haystack).forEach(([k, v]) => {
      // eslint-disable-next-line no-param-reassign
      haystack[k] = maxValueRec(v);
    });
  }
};

const isNestedEmptyArray = (haystack) => {
  if (!Array.isArray(haystack)) {
    return false;
  }
  if (haystack.length === 0) {
    return true;
  }
  return haystack.every((e) => isNestedEmptyArray(e));
};

module.exports = (haystack, needles, opts) => {
  if (opts.useArraySelector === false && isNestedEmptyArray(haystack)) {
    return;
  }

  markNode(haystack);
  needles
    .map((needle) => needle.replace(/^!/, ''))
    .forEach((needle) => {
      const r = objectScan([needle], {
        ...opts,
        breakFn: (key, value) => markNode(value),
        filterFn: (key, value) => markNode(value),
        strict: false
      })(haystack);
      assert(r.length !== 0);
    });

  pruneHaystackRec(haystack);
};
