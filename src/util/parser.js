const PARENT = Symbol("parent");
const setParent = (input, parent) => Object.defineProperty(input, PARENT, { value: parent, writable: false });
const getParent = input => (input[PARENT] === undefined ? null : input[PARENT]);

module.exports = (input) => {
  if (input === "") {
    return [""];
  }

  const result = [];

  let cResult = result;
  let inArray = false;
  let escaped = false;

  const inputLength = input.length;
  let start = 0;
  let charPrev = null;

  const throwError = (msg, context = {}) => {
    throw new Error(Object.entries(context)
      .reduce((p, [k, v]) => `${p}, ${k} ${v}`, `${msg}: ${input}`));
  };
  const invalidTermination = (idx, allowedTerminators) => (start === idx && !allowedTerminators.includes(charPrev));
  const finalizeSegment = (idx) => {
    const segment = input.slice(start, idx);
    if (start !== idx) {
      if (inArray && !/^[*\d]+$/g.test(segment)) {
        throwError("Bad List Selector", { selector: segment });
      }
      cResult.push(inArray ? `[${segment}]` : segment);
    }
    start = idx + 1;
  };

  for (let idx = 0; idx < inputLength; idx += 1) {
    const char = input[idx];
    if (escaped === false) {
      switch (char) {
        case ".":
          if (invalidTermination(idx, ["]", "}"]) || idx === inputLength - 1) {
            throwError("Bad Path Separator", { char: idx });
          }
          finalizeSegment(idx);
          break;
        case ",":
          if (invalidTermination(idx, ["]", "}"]) || getParent(cResult) === null) {
            throwError("Bad Group Separator", { char: idx });
          }
          finalizeSegment(idx);
          break;
        case "[":
          if (invalidTermination(idx, [null, "{", ","]) || inArray !== false) {
            throwError("Bad List Start", { char: idx });
          }
          finalizeSegment(idx);
          inArray = true;
          break;
        case "]":
          if (invalidTermination(idx, ["}"]) || inArray !== true) {
            throwError("Bad List Terminator", { char: idx });
          }
          finalizeSegment(idx);
          inArray = false;
          break;
        case "{":
          if (invalidTermination(idx, [null, ".", "[", "{", ","]) || start !== idx) {
            throwError("Bad Group Start", { char: idx });
          }
          cResult.push(setParent([], cResult));
          cResult = cResult[cResult.length - 1];
          start = idx + 1;
          break;
        case "}":
          if (invalidTermination(idx, ["]", "}"]) || getParent(cResult) === null) {
            throwError("Bad Group Terminator", { char: idx });
          }
          finalizeSegment(idx);
          cResult = getParent(cResult);
          break;
        default:
          break;
      }
    }
    escaped = char === "\\" ? !escaped : false;
    charPrev = char;
  }
  if (start !== inputLength) {
    cResult.push(input.slice(start, inputLength));
  }
  if (getParent(cResult) !== null) {
    throwError("Non Terminated Group");
  }
  if (inArray !== false) {
    throwError("Non Terminated List");
  }
  return result;
};
