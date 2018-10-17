const PARENT = Symbol("parent");
const setParent = (input, parent) => Object.defineProperty(input, PARENT, { value: parent, writable: false });
const getParent = input => (input[PARENT] === undefined ? null : input[PARENT]);

const OR = Symbol("or");
const markOr = input => Object.defineProperty(input, OR, { value: true, writable: false });
const isOr = input => (input[OR] === true);
module.exports.isOr = isOr;

const Result = (input) => {
  const throwError = (msg, context = {}) => {
    throw new Error(Object.entries(context)
      .reduce((p, [k, v]) => `${p}, ${k} ${v}`, `${msg}: ${input}`));
  };

  let cResult = markOr([]);
  let inArray = false;
  let cursor = 0;

  const finishElement = (idx, { msg, finishedOk, finishedRequired = false }) => {
    const isFinished = cursor === idx;
    if (finishedRequired && !isFinished) {
      throwError(msg, { char: idx });
    }
    if (isFinished && !finishedOk) {
      throwError(msg, { char: idx });
    }
    const ele = input.slice(cursor, idx);
    if (cursor !== idx) {
      if (inArray && !/^[*\d]+$/g.test(ele)) {
        throwError("Bad Array Selector", { selector: ele });
      }
      cResult.push(inArray ? `[${ele}]` : ele);
    }
    cursor = idx + 1;
  };

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
    }
    cResult = getParent(cResult);
  };

  newChild(false);

  return {
    setInArray: (flag) => {
      if (inArray === flag) {
        throwError(inArray ? "Bad Array Start" : "Bad Array Terminator");
      }
      inArray = flag;
    },
    finishElement,
    startGroup: () => {
      newChild(true);
      newChild(false);
    },
    newGroupElement: () => {
      finishChild();
      newChild(false);
    },
    finishGroup: () => {
      if (getParent(getParent(cResult)) === null) {
        throwError("Unexpected Group Terminator");
      }
      finishChild();
      finishChild();
    },
    finalizeResult: () => {
      finishChild();
      if (getParent(cResult) !== null) {
        throwError("Non Terminated Group");
      }
      if (inArray) {
        throwError("Non Terminated Array");
      }
      return cResult.length === 1 ? cResult[0] : cResult;
    }
  };
};

module.exports.parse = (input) => {
  if (input === "") {
    return "";
  }

  // setup
  const result = Result(input);

  const inputLength = input.length;
  let charPrev = null;
  let escaped = false;

  const finishElement = result.finishElement;

  // parsing
  for (let idx = 0; idx < inputLength; idx += 1) {
    const char = input[idx];
    if (escaped === false) {
      switch (char) {
        case ".":
          finishElement(idx, { msg: "Bad Path Separator", finishedOk: ["]", "}"].includes(charPrev) });
          break;
        case ",":
          finishElement(idx, { msg: "Bad Group Separator", finishedOk: ["]", "}"].includes(charPrev) });
          result.newGroupElement();
          break;
        case "[":
          finishElement(idx, { msg: "Bad Array Start", finishedOk: [null, "{", ",", "}"].includes(charPrev) });
          result.setInArray(true);
          break;
        case "]":
          finishElement(idx, { msg: "Bad Array Terminator", finishedOk: ["}"].includes(charPrev) });
          result.setInArray(false);
          break;
        case "{":
          finishElement(idx, {
            msg: "Bad Group Start",
            finishedOk: [null, ".", "[", "{", ","].includes(charPrev),
            finishedRequired: true
          });
          result.startGroup();
          break;
        case "}":
          finishElement(idx, { msg: "Bad Group Terminator", finishedOk: ["]", "}"].includes(charPrev) });
          result.finishGroup();
          break;
        default:
          break;
      }
    }
    escaped = char === "\\" ? !escaped : false;
    charPrev = char;
  }
  finishElement(inputLength, { msg: "Bad Terminator", finishedOk: ["]", "}"].includes(charPrev) });
  return result.finalizeResult();
};
