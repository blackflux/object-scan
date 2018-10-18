const OR = Symbol("or");
const markOr = input => Object.defineProperty(input, OR, { value: true, writable: false });
const isOr = input => (input[OR] === true);
module.exports.isOr = isOr;

const throwError = (msg, input, context = {}) => {
  throw new Error(Object.entries(context)
    .reduce((p, [k, v]) => `${p}, ${k} ${v}`, `${msg}: ${input}`));
};

const Result = (input) => {
  const parentStack = [];

  let cResult = markOr([]);
  let inArray = false;
  let cursor = 0;

  // group related
  const newChild = (asOr) => {
    parentStack.push(cResult);
    const child = asOr ? markOr([]) : [];
    cResult.push(child);
    cResult = child;
  };
  const finishChild = () => {
    const parent = parentStack.pop();
    if (cResult.length === 1) {
      parent.splice(-1, 1);
      parent.push(cResult[0]);
    }
    cResult = parent;
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
      if (parentStack.length < 2) {
        throwError("Unexpected Group Terminator", input, { char: idx });
      }
      finishChild();
      finishChild();
    },
    finalizeResult: () => {
      finishChild();
      if (parentStack.length !== 0) {
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
