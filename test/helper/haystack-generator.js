const sampleArray = require('./sample-array');
const CHARS = require('./resources/chars.json');

const heavyMiddle = (x) => 0.5 * (2 * x - 1) ** 3 + 0.5;

module.exports = ({ rng, keys = CHARS }) => {
  const arrayProb = rng();
  const maxCount = heavyMiddle(rng()) * 10;
  const maxDepth = heavyMiddle(rng()) * 10;
  const maxChildren = heavyMiddle(rng()) * 20;
  return ({ count, depth }) => {
    if (count >= maxCount) {
      return undefined;
    }
    if (depth > maxDepth || rng() > (1 - depth * 0.04)) {
      return null;
    }
    const mkArray = rng() < arrayProb;
    const len = Math.floor((rng() ** 0.3) * maxChildren);
    return mkArray ? len : sampleArray(keys, len, { rng, unique: true });
  };
};
