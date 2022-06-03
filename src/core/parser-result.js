import assert from 'assert';
import { defineProperty } from '../generic/helper.js';
import { Wildcard } from './wildcard.js';

const IS_EXCLUDED = Symbol('is-excluded');
const markExcluded = (input) => defineProperty(input, IS_EXCLUDED, true);
const isExcluded = (input) => input[IS_EXCLUDED] === true;

const throwError = (msg, input, context = {}) => {
  throw new Error(Object.entries(context)
    .reduce((p, [k, v]) => `${p}, ${k} ${v}`, `${msg}: ${input}`));
};

const getSimple = (arrOrSet) => {
  if (Array.isArray(arrOrSet)) {
    return arrOrSet.length === 1 ? arrOrSet[0] : arrOrSet;
  }
  return arrOrSet.size === 1 ? arrOrSet.values().next().value : arrOrSet;
};

export default (input) => {
  let cResult = new Set();
  let inArray = false;
  let excludeNext = false;
  let cursor = 0;
  let cId = 0;

  // group related
  const parentStack = [];
  const newChild = (asOr) => {
    if (isExcluded(cResult)) {
      assert(excludeNext === false);
      excludeNext = true;
    }
    parentStack.push(cResult);
    cResult = asOr ? new Set() : [];
  };
  const finishChild = () => {
    const parent = parentStack.pop();
    const parentIsArray = Array.isArray(parent);
    const child = getSimple(cResult);
    if (!parentIsArray && child instanceof Set) {
      child.forEach((e) => parent.add(e));
    } else {
      parent[parentIsArray ? 'push' : 'add'](child);
    }
    cResult = parent;
  };

  newChild(false);

  return {
    setInArray: (flag, idx) => {
      if (inArray === flag) {
        throwError(inArray ? 'Bad Array Start' : 'Bad Array Terminator', input, { char: idx });
      }
      inArray = flag;
    },
    finishElement: (idx, err, fins, { finReq = false, group = false } = {}) => {
      const isFinished = cursor === idx;
      if (isFinished) {
        if (!fins.includes(input[idx - 1] || null)) {
          throwError(err, input, { char: idx });
        }
        cursor += 1;
      } else {
        if (finReq) {
          throwError(err, input, { char: idx });
        }
        const ele = input.slice(cursor, idx);
        if (group && !['**', '++'].includes(ele)) {
          throwError('Bad Group Start', input, { char: idx });
        }
        if (inArray && !(
          /^[?*+\d]+$/.test(ele)
          || (ele.startsWith('(') && ele.endsWith(')'))
        )) {
          throwError('Bad Array Selector', input, { selector: ele });
        }
        cResult.push(
          group
            // todo: convert to string (????)
            // eslint-disable-next-line no-plusplus
            ? Symbol(`${ele}:${++cId}`)
            : new Wildcard(inArray ? `[${ele}]` : ele, excludeNext)
        );
        excludeNext = false;
        cursor = idx + 1;
      }
    },
    startExclusion: (idx) => {
      if (excludeNext !== false) {
        throwError('Redundant Exclusion', input, { char: idx });
      }
      excludeNext = true;
    },
    startGroup: () => {
      newChild(true);
      if (excludeNext) {
        markExcluded(cResult);
        excludeNext = false;
      }
      newChild(false);
    },
    newGroupElement: () => {
      finishChild();
      newChild(false);
    },
    finishGroup: (idx) => {
      if (parentStack.length < 2) {
        throwError('Unexpected Group Terminator', input, { char: idx });
      }
      finishChild();
      finishChild();
      assert(Array.isArray(cResult));
      const symbolMaybe = cResult[cResult.length - 2];
      if (typeof symbolMaybe === 'symbol') {
        cResult.push(symbolMaybe);
      }
    },
    finalizeResult: () => {
      finishChild();
      assert(excludeNext === false);
      if (parentStack.length !== 0) {
        throwError('Non Terminated Group', input);
      }
      if (inArray) {
        throwError('Non Terminated Array', input);
      }
      return getSimple(cResult);
    }
  };
};
