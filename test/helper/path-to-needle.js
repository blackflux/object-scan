const Joi = require('joi-strict');
const { escape } = require('../../src/util/helper');
const sampleArray = require('./sample-array');

module.exports = (needle, params, rng = Math.random) => {
  Joi.assert(needle, Joi.array().items(Joi.string(), Joi.number()));
  Joi.assert(params, Joi.object().keys({
    exclude: Joi.boolean(),
    lenPercentage: Joi.number().min(0).max(1),
    questionMark: Joi.number().integer().min(0),
    partialStar: Joi.number().integer().min(0),
    singleStar: Joi.number().integer().min(0),
    doubleStar: Joi.number().integer().min(0)
  }));
  Joi.assert(rng, Joi.function());

  const result = needle.map((e) => ({
    value: String(e).split('').map((char) => escape(char)),
    string: typeof e === 'string',
    exclude: false
  }));

  const generateIndices = (len, total_ = undefined) => {
    const total = total_ === undefined ? result.length : total_;
    const indices = [...Array(total).keys()];
    const indicesSelected = sampleArray(indices, len, rng);
    const indicesGrouped = indicesSelected.reduce((p, c) => Object.assign(p, { [c]: (p[c] || 0) + 1 }), {});
    return Object
      .entries(indicesGrouped)
      .map(([k, v]) => [parseInt(k, 10), v])
      .sort((a, b) => a[0] - b[0]);
  };

  // generate partial question mark
  if (params.questionMark !== 0) {
    generateIndices(params.questionMark).forEach(([idx, count]) => {
      const value = result[idx].value;
      generateIndices(count, value.length).forEach(([i]) => {
        value[i] = '?';
      });
    });
  }
  // generate partial star
  if (params.partialStar !== 0) {
    generateIndices(params.partialStar).forEach(([idx, count]) => {
      const value = result[idx].value;
      const indices = generateIndices(count, value.length + 1);
      let posPrev = value.length + 1;
      for (let i = 0; i < indices.length; i += 1) {
        const [pos] = indices[i];
        const deleteCount = Math.floor((posPrev - pos + 1) * rng());
        value.splice(pos, deleteCount, '*');
        posPrev = pos;
      }
    });
  }
  // generate single star
  if (params.singleStar !== 0) {
    generateIndices(params.singleStar).forEach(([pos]) => {
      result[pos].value = ['*'];
    });
  }
  // generate double star
  if (params.doubleStar !== 0) {
    const indicesSelected = generateIndices(params.doubleStar, result.length + 1);
    let posPrev = result.length + 1;
    for (let idx = 0; idx < indicesSelected.length; idx += 1) {
      const [pos] = indicesSelected[idx];
      const deleteCount = Math.floor((posPrev - pos + 1) * rng());
      result.splice(pos, deleteCount, {
        value: ['**'],
        string: true,
        exclude: false
      });
      posPrev = pos;
    }
  }
  // crop the result length
  result.length = Math.round(result.length * params.lenPercentage);
  // mark single element as "exclude"
  if (params.exclude === true) {
    result[Math.floor(rng() * result.length)].exclude = true;
  }
  return result.map((e) => ({
    ...e,
    value: e.value.join('')
  }));
};
