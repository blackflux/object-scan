const Joi = require('joi-strict');
const { escape, escapeRegex } = require('../../src/util/helper');
const sampleArray = require('./sample-array');
const shuffleArray = require('./shuffle-array');

module.exports = (...kwargs) => {
  const needle = kwargs[0];
  const params = {
    exclude: false,
    shuffle: false,
    lenPercentage: 1,
    questionMark: 0,
    partialStar: 0,
    singleStar: 0,
    doubleStar: 0,
    regex: 0,
    ...(kwargs[1] || {})
  };
  const rng = kwargs[2] || Math.random;

  Joi.assert(needle, Joi.array().items(Joi.string(), Joi.number()));
  Joi.assert(params, Joi.object().keys({
    exclude: Joi.boolean(),
    shuffle: Joi.boolean(),
    lenPercentage: Joi.number().min(0).max(1),
    questionMark: Joi.number().integer().min(0),
    partialStar: Joi.number().integer().min(0),
    singleStar: Joi.number().integer().min(0),
    doubleStar: Joi.number().integer().min(0),
    regex: Joi.number().integer().min(0)
  }));
  Joi.assert(rng, Joi.function());

  if (needle.length === 0) {
    return [];
  }

  const result = needle.map((e) => ({
    value: String(e).split('').map((char) => escape(char)),
    string: typeof e === 'string',
    exclude: false
  }));

  const generateIndices = (len, { total: total_ = undefined, unique = true } = {}) => {
    const total = total_ === undefined ? result.length : total_;
    const indices = [...Array(total).keys()];
    const indicesSelected = sampleArray(indices, len, { rng, unique });
    const indicesGrouped = indicesSelected.reduce((p, c) => Object.assign(p, { [c]: (p[c] || 0) + 1 }), {});
    return Object
      .entries(indicesGrouped)
      .map(([k, v]) => [parseInt(k, 10), v])
      .sort((a, b) => a[0] - b[0]);
  };

  // generate partial question mark
  if (params.questionMark !== 0) {
    generateIndices(params.questionMark, { unique: false }).forEach(([idx, count]) => {
      const value = result[idx].value;
      generateIndices(count, { total: value.length }).forEach(([i]) => {
        value[i] = '?';
      });
    });
  }
  // generate partial star
  if (params.partialStar !== 0) {
    generateIndices(params.partialStar, { unique: false }).forEach(([idx, count]) => {
      const value = result[idx].value;
      const indices = generateIndices(count, { total: value.length + 1 });
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
    const indicesSelected = generateIndices(params.doubleStar, { total: result.length + 1 });
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
  // generate regex
  if (params.regex !== 0) {
    generateIndices(params.regex).forEach(([pos]) => {
      if (result[pos].value.length === 1 && result[pos].value[0] === '**') {
        result[pos].value[0] = '**(.*)';
      } else {
        result[pos].value = ['(', ...result[pos].value.map((char) => {
          switch (char) {
            case '?':
              return '.';
            case '*':
              return '.*';
            default:
              return escapeRegex(char.slice(-1)[0]);
          }
        }), ')'];
      }
    });
  }
  // crop the result length
  result.length = Math.round(result.length * params.lenPercentage);
  // mark single element as "exclude"
  if (params.exclude === true && result.length !== 0) {
    result[Math.floor(rng() * result.length)].exclude = true;
  }
  // shuffle parameter
  if (params.shuffle === true) {
    result.splice(0, result.length, ...shuffleArray(result, rng));
  }
  return result.map((e) => ({
    ...e,
    value: e.value.join('')
  }));
};
