module.exports = (kwargs, ctx) => {
  if (ctx.rtn === 'context') {
    return {
      onMatch: () => {},
      get: () => ctx.context
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
    let result = 0;
    return {
      onMatch: () => {
        result += 1;
      },
      get: () => result
    };
  }

  const result = [];
  return {
    onMatch: (Array.isArray(ctx.rtn)
      ? () => result.push(ctx.rtn.map((rtn) => kwargs[rtn]))
      : () => result.push(kwargs[ctx.rtn])),
    get: () => (ctx.abort ? result[0] : result)
  };
};
