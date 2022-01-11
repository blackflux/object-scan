import { Wildcard } from './wildcard';
import Result from './parser-result';

const throwError = (msg, input, context = {}) => {
  throw new Error(Object.entries(context)
    .reduce((p, [k, v]) => `${p}, ${k} ${v}`, `${msg}: ${input}`));
};

const parse = (input, ctx) => {
  if (input === '') {
    return new Wildcard('', false);
  }

  const result = Result(input);
  const inputLength = input.length;
  let escaped = false;
  let bracketDepth = 0;

  for (let idx = 0; idx < inputLength; idx += 1) {
    const char = input[idx];
    if (escaped === false && bracketDepth === 0) {
      switch (char) {
        case '.':
          result.finishElement(idx, { err: 'Bad Path Separator', fins: [']', '}'] });
          break;
        case '[':
          if (!ctx.useArraySelector) {
            throwError('Forbidden Array Selector', input, { char: idx });
          }
          result.finishElement(idx, { err: 'Bad Array Start', fins: [null, '!', '{', ',', '}', ']'] });
          result.setInArray(true, idx);
          break;
        case ']':
          result.finishElement(idx, { err: 'Bad Array Terminator', fins: ['}'] });
          result.setInArray(false, idx);
          break;
        case '{':
          result.finishElement(idx, { err: 'Bad Group Start', fins: [null, '!', '.', '[', '{', ','], finReq: true });
          result.startGroup();
          break;
        case ',':
          result.finishElement(idx, { err: 'Bad Group Separator', fins: [']', '}'] });
          result.newGroupElement();
          break;
        case '}':
          result.finishElement(idx, { err: 'Bad Group Terminator', fins: [']', '}'] });
          result.finishGroup(idx);
          break;
        case '!':
          result.finishElement(idx, { err: 'Bad Exclusion', fins: [null, '.', ',', '{', '['], finReq: true });
          result.startExclusion(idx);
          break;
        default:
          break;
      }
    }
    if (escaped === false) {
      switch (char) {
        case '(':
          bracketDepth += 1;
          break;
        case ')':
          if (bracketDepth === 0) {
            throwError('Unexpected Parentheses', input, { char: idx });
          }
          bracketDepth -= 1;
          break;
        default:
          break;
      }
    }
    escaped = char === '\\' ? !escaped : false;
  }

  if (escaped !== false) {
    throwError('Dangling Escape', input, { char: inputLength - 1 });
  }
  if (bracketDepth !== 0) {
    throwError('Unterminated Parentheses', input);
  }

  result.finishElement(inputLength, { err: 'Bad Terminator', fins: [']', '}'] });
  return result.finalizeResult();
};
export default { parse };
