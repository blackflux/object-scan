const CHARS = require('./resources/chars.json');

const MAX_DEPTH = 4;
const MAX_WIDTH = 4;

const generateParsedNeedle = (depth, ctx) => {
  if (!(ctx.index < CHARS.length) || Math.random() * MAX_DEPTH < depth) {
    if (Math.random() > 0.5) {
      return `[${Math.floor(Math.random() * 16)}]`;
    }
    ctx.index += 1;
    return CHARS[(ctx.index - 1) % CHARS.length];
  }
  const result = Math.random() > 0.5 ? new Set() : [];
  for (let idx = 0, len = Math.ceil(Math.random() * MAX_WIDTH); idx < len; idx += 1) {
    const entry = generateParsedNeedle(depth + 1, ctx);
    result[Array.isArray(result) ? 'push' : 'add'](entry);
  }
  return result;
};
module.exports = () => generateParsedNeedle(0, { index: 0 });
