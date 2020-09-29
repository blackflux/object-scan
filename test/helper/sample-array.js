const Joi = require('joi-strict');

module.exports = (arr, len, { rng = Math.random, unique = false } = {}) => {
  Joi.assert({
    arr,
    len,
    rng,
    unique
  }, Joi.object().keys({
    arr: Joi.array().min(1),
    len: Joi.number().integer().min(0),
    rng: Joi.function(),
    unique: Joi.boolean()
  }));

  const available = [];
  const result = [];
  while (result.length < len) {
    if (available.length === 0) {
      available.push(...Array(arr.length).keys());
    }
    const index = Math.floor(rng() * available.length);
    const picked = unique ? available.splice(index, 1)[0] : available[index];
    const char = arr[picked];
    result.push(char);
  }
  return result;
};
