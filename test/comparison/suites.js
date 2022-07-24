import condition from './suites/condition.js';
import key from './suites/key.js';
import recursive from './suites/recursive.js';
import value from './suites/value.js';
import callback from './suites/callback.js';
import parent from './suites/parent.js';
import multiplePaths from './suites/multiple-paths.js';
import wildcard from './suites/wildcard.js';
import regex from './suites/regex.js';
import exclusion from './suites/exclusion.js';
import pathRecursion from './suites/path-recursion.js';
import autoTraverse from './suites/auto-traverse.js';
import partialTraversal from './suites/partial-traversal.js';

export default {
  key,
  value,
  condition,
  recursive,
  callback,
  parent,
  multiplePaths,
  wildcard,
  regex,
  exclusion,
  pathRecursion,
  autoTraverse,
  partialTraversal
};
