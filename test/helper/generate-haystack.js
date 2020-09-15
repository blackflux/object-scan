const Joi = require('joi-strict');

const generateHaystackRec = (params, depth) => {
  const {
    keys,
    array,
    arrayLength,
    objectLength,
    maxDepth,
    maxNodes,
    count
  } = params;
  if (count >= maxNodes) {
    return undefined;
  }
  if (depth > maxDepth()) {
    // eslint-disable-next-line no-param-reassign
    params.count += 1;
    return count;
  }
  if (array() === false) {
    return keys(objectLength())
      .map((k) => [k, generateHaystackRec(params, depth + 1)])
      .filter(([k, v]) => v !== undefined)
      .reduce((p, [k, v]) => Object.assign(p, { [k]: v }), {});
  }
  return [...Array(arrayLength())]
    .map(() => generateHaystackRec(params, depth + 1))
    .filter((v) => v !== undefined);
};

module.exports = (params) => {
  Joi.assert(params, Joi.object().keys({
    keys: Joi.function(),
    array: Joi.function(),
    arrayLength: Joi.function(),
    objectLength: Joi.function(),
    maxDepth: Joi.function(),
    maxNodes: Joi.number().integer().min(1)
  }));
  return generateHaystackRec({ ...params, count: 0 }, 0);
};
