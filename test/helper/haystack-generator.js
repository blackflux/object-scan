const sampleArray = require('./sample-array');
const PRNG = require('./prng');
const chars = require('./resources/chars.json');

module.exports = (seed) => {
  const rng = PRNG(seed);
  return ({ count, depth }) => {
    if (count >= 5) {
      return undefined;
    }
    if (depth > Math.floor(rng() * 5)) {
      return null;
    }
    const mkArray = rng() > 0.5;
    const len = Math.floor(rng() * 5);
    return mkArray ? len : sampleArray(chars, len, { rng, unique: true });
  };
};
