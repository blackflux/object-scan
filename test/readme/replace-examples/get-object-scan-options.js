export default (meta) => {
  const entries = Object.entries({
    joined: meta.joined === 'false' ? undefined : true,
    filterFn: meta.filterFn,
    breakFn: meta.breakFn,
    beforeFn: meta.beforeFn,
    afterFn: meta.afterFn,
    strict: meta.strict,
    rtn: meta.rtn,
    compareFn: meta.compareFn,
    reverse: meta.reverse,
    orderByNeedles: meta.orderByNeedles,
    abort: meta.abort,
    useArraySelector: meta.useArraySelector
  })
    .filter(([k, v]) => v !== undefined);
  const multiline = entries.length > 1 || 'filterFn' in meta || 'breakFn' in meta;
  const result = entries
    .map(([k, v]) => `${k}: ${v}`)
    .join(multiline ? ',\n  ' : ', ');
  if (result === '') {
    return '';
  }
  return multiline ? `, {\n  ${result}\n}` : `, { ${result} }`;
};
