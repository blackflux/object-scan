const sampleArray = require('./sample-array');
const CHARS = require('./resources/chars.json');

module.exports = ({ rng, keys = CHARS }) => ({ count, depth }) => {
  if (count >= 5) {
    return undefined;
  }
  if (depth > Math.floor(rng() * 5)) {
    return null;
  }
  const mkArray = rng() > 0.5;
  const len = Math.floor(rng() * 5);
  return mkArray ? len : sampleArray(keys, len, { rng, unique: true });
};
