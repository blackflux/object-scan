const assert = require('assert');

module.exports = (opts) => {
  const ctx = {
    filterFn: undefined,
    breakFn: undefined,
    beforeFn: undefined,
    afterFn: undefined,
    compareFn: undefined,
    reverse: true,
    orderByNeedles: false,
    abort: false,
    rtn: undefined,
    joined: false,
    useArraySelector: true,
    strict: true,
    ...opts
  };

  assert(Object.keys(ctx).length === 12, 'Unexpected Option provided!');
  assert(['function', 'undefined'].includes(typeof ctx.filterFn));
  assert(['function', 'undefined'].includes(typeof ctx.breakFn));
  assert(['function', 'undefined'].includes(typeof ctx.beforeFn));
  assert(['function', 'undefined'].includes(typeof ctx.afterFn));
  assert(['function', 'undefined'].includes(typeof ctx.compareFn));
  assert(typeof ctx.reverse === 'boolean');
  assert(typeof ctx.orderByNeedles === 'boolean');
  assert(typeof ctx.abort === 'boolean');
  assert(
    [
      undefined, 'context',
      'key', 'value', 'entry',
      'property', 'gproperty', 'parent', 'gparent', 'parents',
      'isMatch', 'matchedBy', 'excludedBy',
      'traversedBy', 'isCircular', 'isLeaf', 'depth',
      'bool', 'count'
    ].includes(ctx.rtn)
    || (
      Array.isArray(ctx.rtn)
      && ctx.rtn.every((e) => [
        'key', 'value', 'entry',
        'property', 'gproperty', 'parent', 'gparent', 'parents',
        'isMatch', 'matchedBy', 'excludedBy',
        'traversedBy', 'isCircular', 'isLeaf', 'depth'
      ].includes(e))
    )
  );
  assert(typeof ctx.joined === 'boolean');
  assert(typeof ctx.useArraySelector === 'boolean');
  assert(typeof ctx.strict === 'boolean');

  return ctx;
};
