const stringifyObject = require('stringify-object');

const pad = (e) => e
  .replace(/^([[{])(.+)([}\]])$/, '$1 $2 $3');

module.exports = (input) => pad(stringifyObject(input, {
  inlineCharacterLimit: Infinity,
  transform: (obj, prop, originalResult) => pad(originalResult)
}));
