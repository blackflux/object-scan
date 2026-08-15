export default (kwargs, ctx) => {
  if (ctx.rtn === 'context') {
    return {
      onMatch: () => {},
      get: () => kwargs.context
    };
  }
  if (ctx.rtn === 'bool') {
    let result = false;
    return {
      onMatch: () => {
        result = true;
      },
      get: () => result
    };
  }
  if (ctx.rtn === 'count') {
    const result = { value: 0 };
    return {
      value: result,
      get: () => result.value
    };
  }
  if (ctx.rtn === 'sum') {
    let result = 0;
    return {
      onMatch: ({ value }) => {
        result += value;
      },
      get: () => result
    };
  }

  const result = [];
  return {
    onMatch: (() => {
      if (typeof ctx.rtn === 'function') {
        return () => result.push(ctx.rtn(kwargs));
      }
      if (Array.isArray(ctx.rtn)) {
        return () => result.push(ctx.rtn.map((rtn) => kwargs[rtn]));
      }
      if (ctx.rtn === 'key') {
        return () => result.push(kwargs.getKey());
      }
      if (ctx.rtn === 'value') {
        return () => result.push(kwargs.getValue());
      }
      return () => result.push(kwargs[ctx.rtn]);
    })(),
    get: () => (ctx.abort ? result[0] : result)
  };
};
