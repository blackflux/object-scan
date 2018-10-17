const PARENT = Symbol("parent");
const setParent = (input, parent) => Object.defineProperty(input, PARENT, { value: parent, writable: false });
const getParent = input => (input[PARENT] === undefined ? null : input[PARENT]);

const OR = Symbol("or");
const markOr = input => Object.defineProperty(input, OR, { value: true, writable: false });
const isOr = input => (input[OR] === true);
module.exports.isOr = isOr;

const Result = (input) => {
  let cResult = markOr([]);

  const throwError = (msg, context = {}) => {
    throw new Error(Object.entries(context)
      .reduce((p, [k, v]) => `${p}, ${k} ${v}`, `${msg}: ${input}`));
  };

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
    add: ele => cResult.push(ele),
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

  let inArray = false;
  let escaped = false;

  const inputLength = input.length;
  let start = 0;
  let charPrev = null;

  // generification
  const throwError = result.throwError;
  const isInvalidTermination = (idx, allowedTerminators) => (start === idx && !allowedTerminators.includes(charPrev));
  const finalizeSegment = (idx) => {
    const segment = input.slice(start, idx);
    if (start !== idx) {
      if (inArray && !/^[*\d]+$/g.test(segment)) {
        throwError("Bad Array Selector", { selector: segment });
      }
      result.add(inArray ? `[${segment}]` : segment);
    }
    start = idx + 1;
  };

  // parsing
  for (let idx = 0; idx < inputLength; idx += 1) {
    const char = input[idx];
    if (escaped === false) {
      switch (char) {
        case ".":
          if (isInvalidTermination(idx, ["]", "}"]) || idx === inputLength - 1) {
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
          if (isInvalidTermination(idx, [null, "{", ",", "}"]) || inArray !== false) {
            throwError("Bad Array Start", { char: idx });
          }
          finalizeSegment(idx);
          inArray = true;
          break;
        case "]":
          if (isInvalidTermination(idx, ["}"]) || inArray !== true) {
            throwError("Bad Array Terminator", { char: idx });
          }
          finalizeSegment(idx);
          inArray = false;
          break;
        case "{":
          if (isInvalidTermination(idx, [null, ".", "[", "{", ","]) || start !== idx) {
            throwError("Bad Group Start", { char: idx });
          }
          start = idx + 1;
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
  finalizeSegment(inputLength);
  if (inArray !== false) {
    throwError("Non Terminated Array");
  }
  return result.finalize();
};
