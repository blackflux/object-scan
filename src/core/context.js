import assert from '../generic/assert.js';

const expect = (opts, option, types) => {
  assert(
    types.includes(typeof opts[option]),
    () => `Option "${option}" not one of [${types.join(', ')}]`
  );
};

export default (opts) => {
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

  assert(Object.keys(ctx).length === 12, 'Unexpected Option provided');
  expect(ctx, 'filterFn', ['function', 'undefined']);
  expect(ctx, 'breakFn', ['function', 'undefined']);
  expect(ctx, 'beforeFn', ['function', 'undefined']);
  expect(ctx, 'afterFn', ['function', 'undefined']);
  expect(ctx, 'compareFn', ['function', 'undefined']);
  expect(ctx, 'reverse', ['boolean']);
  expect(ctx, 'orderByNeedles', ['boolean']);
  expect(ctx, 'abort', ['boolean']);
  assert(
    (
      typeof ctx.rtn === 'function'
      && ctx.rtn.length === 1
    )
    || [
      undefined, 'context',
      'key', 'value', 'entry',
      'property', 'gproperty', 'parent', 'gparent', 'parents',
      'isMatch', 'matchedBy', 'excludedBy',
      'traversedBy', 'isCircular', 'isLeaf', 'depth',
      'bool', 'count', 'sum'
    ].includes(ctx.rtn)
    || (
      Array.isArray(ctx.rtn)
      && ctx.rtn.every((e) => [
        'key', 'value', 'entry',
        'property', 'gproperty', 'parent', 'gparent', 'parents',
        'isMatch', 'matchedBy', 'excludedBy',
        'traversedBy', 'isCircular', 'isLeaf', 'depth'
      ].includes(e))
    ),
    'Option "rtn" is malformed'
  );
  expect(ctx, 'joined', ['boolean']);
  expect(ctx, 'useArraySelector', ['boolean']);
  expect(ctx, 'strict', ['boolean']);
  return ctx;
};
