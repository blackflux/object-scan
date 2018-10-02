/* compile needles to hierarchical map object */
const parser = require("./parser");

const IS_MATCH = Symbol("isMatch");
const markMatch = input => Object.defineProperty(input, IS_MATCH, { value: true, writable: false });
const isMatch = input => input[IS_MATCH] === true;
module.exports.isMatch = isMatch;

const NEEDLE = Symbol("needle");
const setNeedle = (input, needle) => Object.defineProperty(input, NEEDLE, { value: needle, writable: false });
const getNeedle = input => input[NEEDLE] || null;
module.exports.getNeedle = getNeedle;

const NEEDLES = Symbol("needles");
const addNeedle = (input, needle) => {
  if (input[NEEDLES] === undefined) {
    Object.defineProperty(input, NEEDLES, { value: new Set(), writable: false });
  }
  input[NEEDLES].add(needle);
};
const getNeedles = input => [...input[NEEDLES]];
module.exports.getNeedles = getNeedles;

module.exports.getMeta = input => ({
  isMatch: isMatch(input),
  needle: getNeedle(input),
  needles: getNeedles(input)
});

const buildRecursive = (tower, path, needle) => {
  addNeedle(tower, needle);
  if (path.length === 0) {
    setNeedle(tower, needle);
    markMatch(tower);
    return;
  }
  if (Array.isArray(path[0])) {
    path[0].forEach(c => buildRecursive(tower, [c, ...path.slice(1)], needle));
    return;
  }
  if (tower[path[0]] === undefined) {
    Object.assign(tower, { [path[0]]: {} });
  }
  buildRecursive(tower[path[0]], path.slice(1), needle);
};

module.exports.compile = (needles) => {
  const tower = {};
  needles.forEach(needle => buildRecursive(tower, parser(needle), needle));
  return tower;
};
