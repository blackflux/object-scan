import assert from 'assert';
import { compile } from './core/compiler.js';
import find from './core/find.js';
import Context from './core/context.js';

export default (needles, opts = {}) => {
  assert(Array.isArray(needles));
  assert(opts instanceof Object && !Array.isArray(opts));
  if (needles.length === 0) {
    return (_, ctx) => (ctx === undefined ? [] : ctx);
  }

  const ctx = Context(opts);
  const search = compile(needles, ctx); // keep separate for performance
  return (haystack, context) => find(haystack, [search], {
    context,
    ...ctx,
    rtn: ctx.rtn || (context === undefined ? 'key' : 'context')
  });
};
