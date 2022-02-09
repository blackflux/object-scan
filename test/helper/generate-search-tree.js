import CHARS from './resources/chars.js';

const MAX_DEPTH = 7;
const MAX_WIDTH = 7;

const generateSearchTree = (depth, ctx) => {
  if (!(ctx.index < ctx.keys.length) || Math.random() * MAX_DEPTH < depth) {
    return {};
  }
  const result = {};
  for (let idx = 0, len = Math.ceil(Math.random() * MAX_WIDTH); idx < len; idx += 1) {
    result[ctx.keys[ctx.index % ctx.keys.length]] = generateSearchTree(depth + 1, ctx);
    ctx.index += 1;
  }
  return result;
};
export default (keys = CHARS) => generateSearchTree(0, { index: 0, keys });
