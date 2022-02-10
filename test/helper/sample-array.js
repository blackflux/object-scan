import Joi from 'joi-strict';

export default (...args) => {
  Joi.assert(args, Joi.array().ordered(
    Joi.alternatives(
      Joi.array().min(1),
      Joi.number().integer().min(1)
    ),
    Joi.number().integer().min(0),
    Joi.object().keys({
      rng: Joi.function().optional(),
      unique: Joi.boolean().optional()
    }).optional()
  ));
  const [arr_, len, { rng = Math.random, unique = false } = {}] = args;
  const arr = Array.isArray(arr_) ? arr_ : [...Array(arr_).keys()];

  const available = [];
  const result = [];
  while (result.length < len) {
    if (unique) {
      if (available.length === 0) {
        available.push(...Array(arr.length).keys());
      }
      const index = Math.floor(rng() * available.length);
      const picked = available.splice(index, 1)[0];
      const char = arr[picked];
      result.push(char);
    } else {
      const index = Math.floor(rng() * arr.length);
      result.push(arr[index]);
    }
  }
  return result;
};
