const PRNG = require('./prng');
const haystackGenerator = require('./haystack-generator');
const generateKeys = require('./generate-keys');
const generateHaystack = require('./generate-haystack');
const extractPathsFromHaystack = require('./extract-paths-from-haystack');

module.exports = (seed = null) => {
  const rng = PRNG(seed === null ? `${Math.random()}` : seed);
  const keys = generateKeys(Math.ceil(rng() * 30), rng);
  const haystack = generateHaystack(haystackGenerator({ rng, keys }));
  const paths = extractPathsFromHaystack(haystack);
  return { rng, haystack, paths };
};
