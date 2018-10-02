/* compile needles to hierarchical map object */
const parser = require("./parser");

const FINAL = Symbol("final");
const NEEDLES = Symbol("needles");

const markFinal = input => Object.defineProperty(input, FINAL, { value: true, writable: false });
module.exports.isFinal = input => input[FINAL] === true;

const addNeedle = (input, needle) => {
  if (input[NEEDLES] === undefined) {
    Object.defineProperty(input, NEEDLES, { value: new Set(), writable: false });
  }
  input[NEEDLES].add(needle);
};
module.exports.getNeedles = input => [...input[NEEDLES]];

const buildRecursive = (tower, path, needle) => {
  addNeedle(tower, needle);
  if (path.length === 0) {
    markFinal(tower);
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
