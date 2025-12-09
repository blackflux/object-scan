import crypto from 'crypto';
import PRNG from './prng.js';
import haystackGenerator from './haystack-generator.js';
import generateKeys from './generate-keys.js';
import generateHaystack from './generate-haystack.js';
import extractPathsFromHaystack from './extract-paths-from-haystack.js';

export default (seed = null) => {
  const rng = PRNG(seed === null ? crypto.randomUUID() : seed);
  const keys = generateKeys(Math.ceil(rng() * 30), rng);
  const haystack = generateHaystack(haystackGenerator({ rng, keys }));
  const paths = extractPathsFromHaystack(haystack);
  return { rng, haystack, paths };
};
