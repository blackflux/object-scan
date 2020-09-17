const Joi = require('joi-strict');

module.exports = (arr, len, rng = Math.random) => {
  Joi.assert({ arr, len, rng }, Joi.object().keys({
    arr: Joi.array().min(1),
    len: Joi.number().integer().min(0),
    rng: Joi.function()
  }));

  const available = [];
  const result = [];
  while (result.length < len) {
    if (available.length === 0) {
      available.push(...Array(arr.length).keys());
    }
    const index = Math.floor(rng() * available.length);
    const picked = available.splice(index, 1)[0];
    const char = arr[picked];
    result.push(char);
  }
  return result;
};
