const assert = require('assert');
const compiler = require('./core/compiler');
const find = require('./core/find');
const Context = require('./core/context');

module.exports = (needles, opts = {}) => {
  assert(Array.isArray(needles));
  assert(opts instanceof Object && !Array.isArray(opts));
  if (needles.length === 0) {
    return (_, ctx) => (ctx === undefined ? [] : ctx);
  }

  const ctx = Context(opts);
  const search = compiler.compile(needles, ctx); // keep separate for performance
  return (haystack, context) => find(haystack, [search], {
    context,
    ...ctx,
    rtn: ctx.rtn || (context === undefined ? 'key' : 'context')
  });
};
