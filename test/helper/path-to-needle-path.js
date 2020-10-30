const Joi = require('joi-strict');
const { escape, escapeRegex } = require('../../src/generic/helper');
const sampleArray = require('./sample-array');
const sampleArrayGrouped = require('./sample-array-grouped');
const sampleRanges = require('./sample-ranges');
const shuffleArray = require('./shuffle-array');

module.exports = (...kwargs) => {
  const needle = kwargs[0];
  const params = {
    exclude: false,
    shuffle: false,
    lenPercentage: 1,
    questionMark: 0,
    partialPlus: 0,
    partialStar: 0,
    singleStar: 0,
    doublePlus: 0,
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
    partialPlus: Joi.number().integer().min(0),
    partialStar: Joi.number().integer().min(0),
    singleStar: Joi.number().integer().min(0),
    doublePlus: Joi.number().integer().min(0),
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

  // generate partial question mark
  if (params.questionMark !== 0) {
    sampleArrayGrouped(result.length, params.questionMark, { rng })
      .forEach(([idx, count]) => {
        const value = result[idx].value;
        sampleArray(value.length, count, { rng, unique: true })
          .forEach((i) => {
            value[i] = '?';
          });
      });
  }
  // generate partial plus
  if (params.partialPlus !== 0) {
    sampleArrayGrouped(result.length, params.partialPlus, { rng })
      .forEach(([idx, count]) => {
        const value = result[idx].value;
        sampleRanges(value.length, count, { rng, unique: true, alwaysReplace: true })
          .forEach(([pos, len]) => {
            value.splice(pos, len, '+');
          });
      });
  }
  // generate partial star
  if (params.partialStar !== 0) {
    sampleArrayGrouped(result.length, params.partialStar, { rng })
      .forEach(([idx, count]) => {
        const value = result[idx].value;
        sampleRanges(value.length, count, { rng, unique: true })
          .forEach(([pos, len]) => {
            value.splice(pos, len, '*');
          });
      });
  }
  // generate single star
  if (params.singleStar !== 0) {
    sampleArray(result.length, params.singleStar, { rng, unique: true })
      .forEach((pos) => {
        result[pos].value = ['*'];
      });
  }
  // generate double plus
  if (params.doublePlus !== 0) {
    sampleRanges(result.length, params.doublePlus, { rng, unique: true, alwaysReplace: true })
      .forEach(([pos, len]) => {
        const value = { value: ['++'], string: true, exclude: false };
        result.splice(pos, len, value);
      });
  }
  // generate double star
  if (params.doubleStar !== 0) {
    sampleRanges(result.length, params.doubleStar, { rng, unique: true })
      .forEach(([pos, len]) => {
        const value = { value: ['**'], string: true, exclude: false };
        result.splice(pos, len, value);
      });
  }
  // generate regex
  if (params.regex !== 0) {
    sampleArray(result.length, params.regex, { rng, unique: true })
      .forEach((pos) => {
        if (result[pos].value.length === 1 && ['**', '++'].includes(result[pos].value[0])) {
          result[pos].value[0] = `${result[pos].value[0]}(.*)`;
        } else {
          result[pos].value = ['(', ...result[pos].value.map((char) => {
            switch (char) {
              case '?':
                return '.';
              case '*':
                return '.*';
              case '+':
                return '.+';
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
