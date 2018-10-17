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

  // segment related
  const finalizeSegment = (idx) => {
    const segment = input.slice(cursor, idx);
    if (cursor !== idx) {
      if (inArray && !/^[*\d]+$/g.test(segment)) {
        throwError("Bad Array Selector", { selector: segment });
      }
      cResult.push(inArray ? `[${segment}]` : segment);
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
    throwError,
    getCursor: () => cursor,
    setInArray: (flag) => {
      if (inArray === flag) {
        throwError(inArray ? "Bad Array Start" : "Bad Array Terminator");
      }
      inArray = flag;
    },
    finalizeSegment,
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
    finalize: () => {
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

  const throwError = result.throwError;
  const finalizeSegment = result.finalizeSegment;
  const isInvalidTermination = (idx, allowedTerminators) => (
    result.getCursor() === idx
    && !allowedTerminators.includes(charPrev)
  );

  // parsing
  for (let idx = 0; idx < inputLength; idx += 1) {
    const char = input[idx];
    if (escaped === false) {
      switch (char) {
        case ".":
          if (isInvalidTermination(idx, ["]", "}"])) {
            throwError("Bad Path Separator", { char: idx });
          }
          finalizeSegment(idx);
          break;
        case ",":
          if (isInvalidTermination(idx, ["]", "}"])) {
            throwError("Bad Group Separator", { char: idx });
          }
          finalizeSegment(idx);
          result.newGroupElement();
          break;
        case "[":
          if (isInvalidTermination(idx, [null, "{", ",", "}"])) {
            throwError("Bad Array Start", { char: idx });
          }
          finalizeSegment(idx);
          result.setInArray(true);
          break;
        case "]":
          if (isInvalidTermination(idx, ["}"])) {
            throwError("Bad Array Terminator", { char: idx });
          }
          finalizeSegment(idx);
          result.setInArray(false);
          break;
        case "{":
          if (isInvalidTermination(idx, [null, ".", "[", "{", ","]) || result.getCursor() !== idx) {
            throwError("Bad Group Start", { char: idx });
          }
          finalizeSegment(idx);
          result.startGroup();
          break;
        case "}":
          if (isInvalidTermination(idx, ["]", "}"])) {
            throwError("Bad Group Terminator", { char: idx });
          }
          finalizeSegment(idx);
          result.finishGroup();
          break;
        default:
          break;
      }
    }
    escaped = char === "\\" ? !escaped : false;
    charPrev = char;
  }
  if (isInvalidTermination(inputLength, ["]", "}"])) {
    throwError("Bad Terminator");
  }
  finalizeSegment(inputLength);
  return result.finalize();
};
