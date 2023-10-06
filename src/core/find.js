import {
  excludedBy, traversedBy, matchedBy, isLastLeafMatch, formatPath
} from './find-util.js';
import Result from './find-result.js';

export default (haystack_, search_, ctx) => {
  const state = {
    haystack: haystack_,
    context: ctx.context
  };
  if (ctx.beforeFn !== undefined) {
    const r = ctx.beforeFn(state);
    if (r !== undefined) {
      state.haystack = r;
    }
  }
  const stack = [false, [search_], null, 0];
  const path = [];
  const parents = [];

  let depth;
  let segment;
  let searches;
  let isMatch;
  let haystack = state.haystack;

  const kwargs = {
    getKey: (joined = ctx.joined) => formatPath(path, joined),
    get key() {
      return kwargs.getKey();
    },
    getValue: () => haystack,
    get value() {
      return kwargs.getValue();
    },
    getEntry: (joined = ctx.joined) => [formatPath(path, joined), haystack],
    get entry() {
      return kwargs.getEntry();
    },
    getIsMatch: () => isMatch,
    get isMatch() {
      return kwargs.getIsMatch();
    },
    getMatchedBy: () => matchedBy(searches),
    get matchedBy() {
      return kwargs.getMatchedBy();
    },
    getExcludedBy: () => excludedBy(searches),
    get excludedBy() {
      return kwargs.getExcludedBy();
    },
    getTraversedBy: () => traversedBy(searches),
    get traversedBy() {
      return kwargs.getTraversedBy();
    },
    getGproperty: () => path[path.length - 2],
    get gproperty() {
      return kwargs.getGproperty();
    },
    getProperty: () => path[path.length - 1],
    get property() {
      return kwargs.getProperty();
    },
    getGparent: () => parents[parents.length - 2],
    get gparent() {
      return kwargs.getGparent();
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
    getDepth: () => path.length,
    get depth() {
      return kwargs.getDepth();
    },
    /* getResult: <defined-below> */
    get result() {
      return kwargs.getResult();
    },
    context: state.context
  };

  const result = Result(kwargs, ctx);
  kwargs.getResult = () => result.get();

  if (ctx.useArraySelector || !Array.isArray(state.haystack)) {
    const child = search_.get('');
    if (child !== undefined) {
      stack[1].push(child);
    }
  }

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
      haystack = state.haystack;
    }

    if (isMatch) {
      if (ctx.filterFn === undefined || ctx.filterFn(kwargs) !== false) {
        result.onMatch(kwargs);
        if (ctx.abort) {
          stack.length = 0;
        }
      }
      // eslint-disable-next-line no-continue
      continue;
    }

    if (!searches.some(({ matches }) => matches)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const autoTraverseArray = ctx.useArraySelector === false && Array.isArray(haystack);

    if (!autoTraverseArray && isLastLeafMatch(searches)) {
      stack.push(true, searches, segment, depth);
      isMatch = true;
    }

    if (
      (ctx.breakFn === undefined || ctx.breakFn(kwargs) !== true)
      && haystack instanceof Object
    ) {
      const isArray = Array.isArray(haystack);
      const keys = isArray
        ? haystack.map((_, i) => i).filter(() => true)
        : Object.keys(haystack);
      if (!isArray && ctx.compareFn) {
        keys.sort(ctx.compareFn(kwargs));
      }
      if (!ctx.reverse) {
        keys.reverse();
      }
      for (let kIdx = 0, kLen = keys.length; kIdx < kLen; kIdx += 1) {
        const key = keys[kIdx];
        const searchesOut = [];
        if (autoTraverseArray) {
          searchesOut.push(...searches);
          if (depth === 0) {
            searchesOut.push(...search_.roots);
          }
        } else {
          for (let sIdx = 0, sLen = searches.length; sIdx !== sLen; sIdx += 1) {
            const search = searches[sIdx];
            if (search.recMatch(key)) {
              searchesOut.push(search);
            }
            const { children } = search;
            let eIdx = children.length;
            // eslint-disable-next-line no-plusplus
            while (eIdx--) {
              const child = children[eIdx];
              if (child.typeMatch(key, isArray)) {
                searchesOut.push(child);
              }
            }
          }
        }
        if (ctx.orderByNeedles) {
          searchesOut.index = Buffer.from(searchesOut.map(({ order }) => order).sort());
          let checkIdx = stack.length - 3;
          const checkIdxMin = checkIdx - kIdx * 4;
          while (checkIdx !== checkIdxMin && Buffer.compare(searchesOut.index, stack[checkIdx].index) === 1) {
            checkIdx -= 4;
          }
          stack.splice(checkIdx + 3, 0, false, searchesOut, key, depth + 1);
        } else {
          stack.push(false, searchesOut, key, depth + 1);
        }
      }
    }
  } while (stack.length !== 0);

  state.result = result.get();
  if (ctx.afterFn !== undefined) {
    const r = ctx.afterFn(state);
    if (r !== undefined) {
      state.result = r;
    }
  }
  return state.result;
};
