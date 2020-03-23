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

module.exports = (haystack, needles) => {
  markNode(haystack);
  needles
    .map((needle) => needle.replace(/^!/, ''))
    .forEach((needle) => {
      const r = objectScan([needle], {
        breakFn: (key, value) => markNode(value),
        filterFn: (key, value) => markNode(value),
        strict: false
      })(haystack);
      assert(r.length !== 0);
    });

  pruneHaystackRec(haystack);
};
