const assert = require('assert');
const compiler = require('./core/compiler');
const find = require('./core/find');

module.exports = (needles, opts = {}) => {
  assert(Array.isArray(needles));
  assert(opts instanceof Object && !Array.isArray(opts));
  if (needles.length === 0) {
    return (_, ctx) => (ctx === undefined ? [] : ctx);
  }

  const ctx = {
    filterFn: undefined,
    breakFn: undefined,
    compareFn: undefined,
    reverse: true,
    abort: false,
    rtn: undefined,
    joined: false,
    useArraySelector: true,
    strict: true,
    ...opts
  };
  assert(Object.keys(ctx).length === 9, 'Unexpected Option provided!');
  assert(['function', 'undefined'].includes(typeof ctx.filterFn));
  assert(['function', 'undefined'].includes(typeof ctx.breakFn));
  assert(['function', 'undefined'].includes(typeof ctx.compareFn));
  assert(typeof ctx.reverse === 'boolean');
  assert(typeof ctx.abort === 'boolean');
  assert([
    undefined, 'context',
    'key', 'value', 'entry',
    'property', 'parent', 'parents',
    'isMatch', 'matchedBy', 'excludedBy',
    'traversedBy', 'isCircular', 'isLeaf', 'depth',
    'bool', 'count'
  ].includes(opts.rtn));
  assert(typeof ctx.joined === 'boolean');
  assert(typeof ctx.useArraySelector === 'boolean');
  assert(typeof ctx.strict === 'boolean');

  const search = compiler.compile(needles, ctx.strict, ctx.useArraySelector); // keep separate for performance
  return (haystack, context) => find(haystack, [search], {
    context,
    ...ctx,
    rtn: ctx.rtn || (context === undefined ? 'key' : 'context')
  });
};
