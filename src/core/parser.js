import { Wildcard } from './parser/wildcard.js';
import Result from './parser/result.js';

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
    if (escaped === false) {
      if (bracketDepth === 0) {
        switch (char) {
          case '.':
            result.finishElement(idx, 'Bad Path Separator', [']', '}']);
            break;
          case '[':
            if (!ctx.useArraySelector) {
              throwError('Forbidden Array Selector', input, { char: idx });
            }
            result.finishElement(idx, 'Bad Array Start', [null, '!', '{', ',', '}', ']']);
            result.setInArray(true, idx);
            break;
          case ']':
            result.finishElement(idx, 'Bad Array Terminator', ['}']);
            result.setInArray(false, idx);
            break;
          case '{':
            result.finishElement(idx, 'Bad Group Start', [null, '!', '.', '[', '{', ','], { group: true });
            result.startGroup();
            break;
          case ',':
            result.finishElement(idx, 'Bad Group Separator', [']', '}']);
            result.newGroupElement();
            break;
          case '}':
            result.finishElement(idx, 'Bad Group Terminator', [']', '}']);
            result.finishGroup(idx);
            break;
          case '!':
            result.finishElement(idx, 'Bad Exclusion', [null, '.', ',', '{', '['], { finReq: true });
            result.startExclusion(idx);
            break;
          default:
            break;
        }
      }
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

  result.finishElement(inputLength, 'Bad Terminator', [']', '}']);
  return result.finalizeResult();
};
export default { parse };
