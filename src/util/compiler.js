/* compile needles to hierarchical map object */
const parser = require('./parser');

const IS_MATCH = Symbol('isMatch');
const markMatch = input => Object.defineProperty(input, IS_MATCH, { value: true, writable: false });
const isMatch = input => input[IS_MATCH] === true;
module.exports.isMatch = isMatch;

const NEEDLE = Symbol('needle');
const setNeedle = (input, needle) => Object.defineProperty(input, NEEDLE, { value: needle, writable: false });
const getNeedle = input => (input[NEEDLE] === undefined ? null : input[NEEDLE]);
module.exports.getNeedle = getNeedle;

const NEEDLES = Symbol('needles');
const addNeedle = (input, needle) => {
  if (input[NEEDLES] === undefined) {
    Object.defineProperty(input, NEEDLES, { value: new Set(), writable: false });
  }
  input[NEEDLES].add(needle);
};
const getNeedles = input => [...input[NEEDLES]];
module.exports.getNeedles = getNeedles;

const WILDCARD_REGEX = Symbol('wildcard-regex');
const setWildcardRegex = (input, wildcard) => {
  Object.defineProperty(input, WILDCARD_REGEX, {
    value: new RegExp(`^${wildcard
      .split(/(?<!\\)(?:\\\\)*\*/)
      .map(p => p.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'))
      .join('.*')}$`),
    writable: false
  });
};
const getWildcardRegex = input => input[WILDCARD_REGEX];
module.exports.getWildcardRegex = getWildcardRegex;

module.exports.getMeta = (inputs, parents = null) => ({
  isMatch: inputs.some(e => isMatch(e)),
  matches: inputs.map(e => getNeedle(e)).filter(e => e !== null),
  needles: inputs.reduce((p, e) => {
    p.push(...getNeedles(e));
    return p;
  }, []),
  parents
});

const buildRecursive = (tower, path, needle) => {
  addNeedle(tower, needle);
  if (path.length === 0) {
    if (tower[NEEDLE] !== undefined) {
      throw new Error(`Redundant Needle Target: "${tower[NEEDLE]}" vs "${needle}"`);
    }
    setNeedle(tower, needle);
    markMatch(tower);
    return;
  }
  if (Array.isArray(path[0])) {
    buildRecursive(tower, [...path[0], ...path.slice(1)], needle);
    return;
  }
  if (path[0] instanceof Set) {
    path[0].forEach(c => buildRecursive(tower, [c, ...path.slice(1)], needle));
    return;
  }
  if (tower[path[0]] === undefined) {
    Object.assign(tower, { [path[0]]: {} });
    setWildcardRegex(tower[path[0]], path[0]);
  }
  buildRecursive(tower[path[0]], path.slice(1), needle);
};

module.exports.compile = (needles) => {
  const tower = {};
  needles.forEach(needle => buildRecursive(tower, [parser(needle)], needle));
  return tower;
};
