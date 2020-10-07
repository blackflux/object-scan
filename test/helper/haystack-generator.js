const sampleArray = require('./sample-array');
const CHARS = require('./resources/chars.json');

module.exports = ({ rng, keys = CHARS }) => {
  const arrayProb = rng();
  const maxLeaves = Math.ceil(rng() * 20);
  const maxDepth = Math.ceil(rng() * 10);
  const maxBranching = 20;
  return ({ count, depth }) => {
    if (count >= maxLeaves) {
      return undefined;
    }
    if (depth >= maxDepth || rng() > (1 - depth * 0.04)) {
      return null;
    }
    const mkArray = rng() < arrayProb;
    const len = Math.floor((rng() ** 0.3) * maxBranching);
    return mkArray ? len : sampleArray(keys, len, { rng, unique: true });
  };
};
