const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const MAX_DEPTH = 7;
const MAX_WIDTH = 7;

let index = 0;
const generateSearchTree = (depth = 0) => {
  if (depth === 0) {
    index = 0;
  }
  if (!(index < CHARS.length) || Math.random() * MAX_DEPTH < depth) {
    return {};
  }
  const result = {};
  for (let idx = 0, len = Math.ceil(Math.random() * MAX_WIDTH); idx < len; idx += 1) {
    result[CHARS[index % CHARS.length]] = generateSearchTree(depth + 1);
    index += 1;
  }
  return result;
};
module.exports = () => generateSearchTree();
