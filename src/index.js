import assert from './generic/assert.js';
import { compile } from './core/compiler.js';
import find from './core/find.js';
import Context from './core/context.js';

export default (needles, opts = {}) => {
  assert(
    Array.isArray(needles),
    'Argument "needles" expected to be Array'
  );
  assert(
    opts instanceof Object && !Array.isArray(opts),
    'Argument "opts" expected to be Object'
  );
  if (needles.length === 0) {
    return (_, ctx) => (ctx === undefined ? [] : ctx);
  }

  const ctx = Context(opts);
  const search = compile(needles, ctx); // keep separate for performance
  return (haystack, context) => find(haystack, search, {
    context,
    ...ctx,
    rtn: ctx.rtn || (context === undefined ? 'key' : 'context')
  });
};
