const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const MAX_DEPTH = 4;
const MAX_WIDTH = 4;

let index = 0;
const generateParsed = (depth = 0) => {
  if (depth === 0) {
    index = 0;
  }
  if (!(index < CHARS.length) || Math.random() * MAX_DEPTH < depth) {
    index += 1;
    return CHARS[(index - 1) % CHARS.length];
  }
  const result = Math.random() > 0.5 ? new Set() : [];
  for (let idx = 0, len = Math.ceil(Math.random() * MAX_WIDTH); idx < len; idx += 1) {
    const entry = generateParsed(depth + 1);
    result[Array.isArray(result) ? 'push' : 'add'](entry);
  }
  return result;
};
module.exports = () => generateParsed();
