import stringifyObject from 'stringify-object';

const pad = (e) => e
  .replace(/^([[{])(.+)([}\]])$/, '$1 $2 $3');

export default (input) => pad(stringifyObject(input, {
  inlineCharacterLimit: Infinity,
  transform: (obj, prop, originalResult) => pad(originalResult)
}));
