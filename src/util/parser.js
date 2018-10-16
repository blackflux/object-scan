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

  const finalizeSegment = (idx) => {
    const segment = input.slice(start, idx);
    if (start !== idx) {
      if (inArray && !/^[*\d]+$/g.test(segment)) {
        throw new Error(`Bad List Selector: ${input}, selector ${segment}`);
      }
      cResult.push(inArray ? `[${segment}]` : segment);
    }
    start = idx + 1;
  };

  let charPrev = null;
  for (let idx = 0; idx < inputLength; idx += 1) {
    const char = input[idx];
    if (escaped === false) {
      switch (char) {
        case ".":
          if ((start === idx && !["]", "}"].includes(charPrev)) || idx === inputLength - 1) {
            throw new Error(`Bad Path Separator: ${input}, char ${idx}`);
          }
          finalizeSegment(idx);
          break;
        case ",":
          if ((start === idx && !["]", "}"].includes(charPrev)) || getParent(cResult) === null) {
            throw new Error(`Bad Group Separator: ${input}, char ${idx}`);
          }
          finalizeSegment(idx);
          break;
        case "[":
          if ((start === idx && ![null, "{", ","].includes(charPrev)) || inArray !== false) {
            throw new Error(`Bad List Selector: ${input}, char ${idx}`);
          }
          finalizeSegment(idx);
          inArray = true;
          break;
        case "]":
          if (inArray !== true) {
            throw new Error(`Bad List Selector: ${input}, char ${idx}`);
          }
          finalizeSegment(idx);
          inArray = false;
          break;
        case "{":
          if ((start === idx && ![null, ".", "[", "{", ","].includes(charPrev)) || start !== idx) {
            throw new Error(`Bad Group Start: ${input}, char ${idx}`);
          }
          cResult.push(setParent([], cResult));
          cResult = cResult[cResult.length - 1];
          start = idx + 1;
          break;
        case "}":
          if ((start === idx && !["]", "}"].includes(charPrev)) || getParent(cResult) === null) {
            throw new Error(`Bad Group Separator: ${input}, char ${idx}`);
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
    throw new Error(`Non Terminated Group Separator: ${input}`);
  }
  if (inArray !== false) {
    throw new Error(`Non Terminated List Separator: ${input}`);
  }
  return result;
};
