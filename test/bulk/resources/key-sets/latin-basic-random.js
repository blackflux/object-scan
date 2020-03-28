const sampleSize = require('lodash.samplesize');

const data = require('./latin-basic-char');

const gen = () => sampleSize(
  data.filter((e) => e !== ' '),
  Math.ceil(Math.random() * 20)
)
  .sort((a, b) => Math.random() - 0.5).join('');

module.exports = (count) => [...Array(count)].map(() => gen());
