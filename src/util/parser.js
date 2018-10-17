const assert = require("assert");

const PARENT = Symbol("parent");
const setParent = (input, parent) => Object.defineProperty(input, PARENT, { value: parent, writable: true });
const getParent = input => (input[PARENT] === undefined ? null : input[PARENT]);

const OR = Symbol("or");
const markOr = input => Object.defineProperty(input, OR, { value: true, writable: false });
const isOr = input => (input[OR] === true);
module.exports.isOr = isOr;

const throwError = (msg, input, context = {}) => {
  throw new Error(Object.entries(context)
    .reduce((p, [k, v]) => `${p}, ${k} ${v}`, `${msg}: ${input}`));
};

const Result = (input) => {
  let cResult = markOr([]);
  let inArray = false;
  let cursor = 0;

  // group related
  const newChild = (asOr) => {
    const child = setParent(asOr ? markOr([]) : [], cResult);
    cResult.push(child);
    cResult = child;
  };
  const finishChild = () => {
    if (cResult.length === 1) {
      const parent = getParent(cResult);
      parent.splice(-1, 1);
      parent.push(cResult[0]);
      // update parent as required
      const hasParent = getParent(cResult[0]) !== null;
      assert(hasParent === (typeof cResult[0] === "object"));
      if (hasParent) {
        setParent(cResult[0], parent);
      }
    }
    cResult = getParent(cResult);
  };

  newChild(false);

  return {
    setInArray: (flag, idx) => {
      if (inArray === flag) {
        throwError(inArray ? "Bad Array Start" : "Bad Array Terminator", input, { char: idx });
      }
      inArray = flag;
    },
    finishElement: (idx, { err, fins, finishedReq = false }) => {
      const isFinished = cursor === idx;
      if (finishedReq && !isFinished) {
        throwError(err, input, { char: idx });
      }
      if (isFinished && !fins.includes(input[idx - 1] || null)) {
        throwError(err, input, { char: idx });
      }
      const ele = input.slice(cursor, idx);
      if (cursor !== idx) {
        if (inArray && !/^[*\d]+$/g.test(ele)) {
          throwError("Bad Array Selector", input, { selector: ele });
        }
        cResult.push(inArray ? `[${ele}]` : ele);
      }
      cursor = idx + 1;
    },
    startGroup: () => {
      newChild(true);
      newChild(false);
    },
    newGroupElement: () => {
      finishChild();
      newChild(false);
    },
    finishGroup: (idx) => {
      if (getParent(getParent(cResult)) === null) {
        throwError("Unexpected Group Terminator", input, { char: idx });
      }
      finishChild();
      finishChild();
    },
    finalizeResult: () => {
      finishChild();
      if (getParent(cResult) !== null) {
        throwError("Non Terminated Group", input);
      }
      if (inArray) {
        throwError("Non Terminated Array", input);
      }
      return cResult.length === 1 ? cResult[0] : cResult;
    }
  };
};

module.exports.parse = (input) => {
  if (input === "") {
    return "";
  }

  const result = Result(input);
  const inputLength = input.length;
  let escaped = false;

  for (let idx = 0; idx < inputLength; idx += 1) {
    const char = input[idx];
    if (escaped === false) {
      switch (char) {
        case ".":
          result.finishElement(idx, { err: "Bad Path Separator", fins: ["]", "}"] });
          break;
        case "[":
          result.finishElement(idx, { err: "Bad Array Start", fins: [null, "{", ",", "}"] });
          result.setInArray(true, idx);
          break;
        case "]":
          result.finishElement(idx, { err: "Bad Array Terminator", fins: ["}"] });
          result.setInArray(false, idx);
          break;
        case "{":
          result.finishElement(idx, { err: "Bad Group Start", fins: [null, ".", "[", "{", ","], finishedReq: true });
          result.startGroup();
          break;
        case ",":
          result.finishElement(idx, { err: "Bad Group Separator", fins: ["]", "}"] });
          result.newGroupElement();
          break;
        case "}":
          result.finishElement(idx, { err: "Bad Group Terminator", fins: ["]", "}"] });
          result.finishGroup(idx);
          break;
        default:
          break;
      }
    }
    escaped = char === "\\" ? !escaped : false;
  }

  result.finishElement(inputLength, { err: "Bad Terminator", fins: ["]", "}"] });
  return result.finalizeResult();
};
