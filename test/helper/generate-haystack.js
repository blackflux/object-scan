const assert = require('assert');

const generateHaystackRec = (params, depth) => {
  const {
    generator,
    count
  } = params;
  const generated = generator({ count, depth });
  if (generated === undefined) {
    return undefined;
  }
  if (generated === null) {
    // eslint-disable-next-line no-param-reassign
    params.count += 1;
    return count;
  }
  if (Array.isArray(generated)) {
    return generated
      .map((k) => [k, generateHaystackRec(params, depth + 1)])
      .filter(([k, v]) => v !== undefined)
      .reduce((p, [k, v]) => Object.assign(p, { [k]: v }), {});
  }
  assert(Number.isInteger(generated));
  return [...Array(generated)]
    .map(() => generateHaystackRec(params, depth + 1))
    .filter((v) => v !== undefined);
};

module.exports = (generator) => generateHaystackRec({ generator, count: 0 }, 0);
