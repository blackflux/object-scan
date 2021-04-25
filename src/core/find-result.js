module.exports = (kwargs, ctx) => {
  if (ctx.rtn === 'context') {
    return {
      onMatch: () => {},
      finish: () => ctx.context
    };
  }
  if (ctx.rtn === 'bool') {
    let result = false;
    return {
      onMatch: () => {
        result = true;
      },
      finish: () => result
    };
  }
  if (ctx.rtn === 'count') {
    let result = 0;
    return {
      onMatch: () => {
        result += 1;
      },
      finish: () => result
    };
  }

  const result = [];
  return {
    onMatch: (Array.isArray(ctx.rtn)
      ? () => result.push(ctx.rtn.map((rtn) => kwargs[rtn]))
      : () => result.push(kwargs[ctx.rtn])),
    finish: () => (ctx.abort ? result[0] : result)
  };
};
