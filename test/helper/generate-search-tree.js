const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const MAX_DEPTH = 7;
const MAX_WIDTH = 7;

const generateSearchTree = (depth, ctx) => {
  if (!(ctx.index < CHARS.length) || Math.random() * MAX_DEPTH < depth) {
    return {};
  }
  const result = {};
  for (let idx = 0, len = Math.ceil(Math.random() * MAX_WIDTH); idx < len; idx += 1) {
    result[CHARS[ctx.index % CHARS.length]] = generateSearchTree(depth + 1, ctx);
    ctx.index += 1;
  }
  return result;
};
module.exports = () => generateSearchTree(0, { index: 0 });
