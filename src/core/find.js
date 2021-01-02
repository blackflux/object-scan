const assert = require('assert');
const compiler = require('./compiler');
const Result = require('./find-result');
const { toPath } = require('../generic/helper');

const formatPath = (input, ctx) => (ctx.joined ? toPath(input) : [...input]);

module.exports = (haystack_, searches_, ctx) => {
  const stack = [false, searches_, null, 0];
  const path = [];
  const parents = [];

  let depth;
  let segment;
  let searches;
  let isMatch;
  let haystack = haystack_;

  const kwargs = {
    getKey: () => formatPath(path, ctx),
    get key() {
      return kwargs.getKey();
    },
    getValue: () => haystack,
    get value() {
      return kwargs.getValue();
    },
    getEntry: () => [formatPath(path, ctx), haystack],
    get entry() {
      return kwargs.getEntry();
    },
    getIsMatch: () => isMatch,
    get isMatch() {
      return kwargs.getIsMatch();
    },
    getMatchedBy: () => compiler.matchedBy(searches),
    get matchedBy() {
      return kwargs.getMatchedBy();
    },
    getExcludedBy: () => compiler.excludedBy(searches),
    get excludedBy() {
      return kwargs.getExcludedBy();
    },
    getTraversedBy: () => compiler.traversedBy(searches),
    get traversedBy() {
      return kwargs.getTraversedBy();
    },
    getProperty: () => path[path.length - 1],
    get property() {
      return kwargs.getProperty();
    },
    getParent: () => parents[parents.length - 1],
    get parent() {
      return kwargs.getParent();
    },
    getParents: () => [...parents].reverse(),
    get parents() {
      return kwargs.getParents();
    },
    getIsCircular: () => parents.includes(haystack),
    get isCircular() {
      return kwargs.getIsCircular();
    },
    getIsLeaf: () => !(haystack instanceof Object),
    get isLeaf() {
      return kwargs.getIsLeaf();
    },
    context: ctx.context
  };

  const result = Result(kwargs, ctx);

  do {
    depth = stack.pop();
    segment = stack.pop();
    searches = stack.pop();
    isMatch = stack.pop();

    const diff = path.length - depth;
    for (let idx = 0; idx < diff; idx += 1) {
      parents.pop();
      path.pop();
    }
    if (diff === -1) {
      parents.push(haystack);
      path.push(segment);
      haystack = haystack[segment];
    } else if (segment !== null) {
      path[path.length - 1] = segment;
      haystack = parents[parents.length - 1][segment];
    } else {
      haystack = haystack_;
    }

    if (isMatch) {
      if (ctx.filterFn === undefined || ctx.filterFn(kwargs) !== false) {
        result.onMatch();
        if (ctx.abort) {
          return result.finish();
        }
      }
      // eslint-disable-next-line no-continue
      continue;
    }

    if (!searches.some((s) => compiler.hasMatches(s))) {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (ctx.useArraySelector === false && Array.isArray(haystack)) {
      if (ctx.breakFn === undefined || ctx.breakFn(kwargs) !== true) {
        for (let idx = 0, len = haystack.length; idx < len; idx += 1) {
          stack.push(false, searches, idx, depth + 1);
        }
      }
      // eslint-disable-next-line no-continue
      continue;
    }

    const searchesIn = searches;

    if (compiler.isLastLeafMatch(searches)) {
      stack.push(true, searches, segment, depth);
      isMatch = true;
    }

    if ('' in searches[0] && path.every((p) => Number.isInteger(p))) {
      assert(searches.length === 1);
      stack.push(true, [searches[0]['']], segment, depth);
      isMatch = true;
      searches = [searches[0]['']];
    }

    if (
      (ctx.breakFn === undefined || ctx.breakFn(kwargs) !== true)
      && haystack instanceof Object
    ) {
      const isArray = Array.isArray(haystack);
      const keys = isArray ? haystack : Object.keys(haystack);
      for (let kIdx = 0, kLen = keys.length; kIdx < kLen; kIdx += 1) {
        const key = isArray ? kIdx : keys[kIdx];
        const searchesOut = [];
        for (let sIdx = 0, sLen = searchesIn.length; sIdx < sLen; sIdx += 1) {
          const search = searchesIn[sIdx];
          const wildcard = compiler.getWildcard(search);
          if (wildcard.isRec && wildcard.anyMatch(key)) {
            searchesOut.push(search);
          }
          const values = compiler.getValues(search);
          for (let eIdx = 0, eLen = values.length; eIdx < eLen; eIdx += 1) {
            const value = values[eIdx];
            if (compiler.getWildcard(value).typeMatch(key, isArray)) {
              searchesOut.push(value);
            }
          }
        }
        stack.push(false, searchesOut, key, depth + 1);
      }
    }
  } while (stack.length !== 0);

  return result.finish();
};
