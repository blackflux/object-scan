const Joi = require('joi-strict');
const sampleArray = require('./sample-array');

module.exports = (...args) => {
  Joi.assert(args, Joi.array().ordered(
    Joi.number().integer().min(0),
    Joi.number().integer().min(0),
    Joi.object().keys({
      rng: Joi.function().optional(),
      unique: Joi.boolean().optional(),
      alwaysReplace: Joi.boolean().optional()
    }).optional()
  ));
  const [length, count, { rng = Math.random, unique = false, alwaysReplace = false } = {}] = args;
  const array = alwaysReplace
    ? [...Array(length).keys()]
    : [...Array(length + 1).keys()];
  const indices = [...new Set(sampleArray(array, count, { rng, unique }))]
    .sort((a, b) => b - a);

  const result = [];
  let posPrev = length + 1;
  indices.forEach((pos) => {
    const deleteCount = alwaysReplace
      ? Math.floor((posPrev - pos - 1) * rng()) + 1
      : Math.floor((posPrev - pos) * rng());
    result.push([pos, deleteCount]);
    posPrev = pos;
  });

  return result;
};
