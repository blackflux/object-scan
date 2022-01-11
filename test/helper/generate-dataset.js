import { v4 } from 'uuid';
import PRNG from './prng';
import haystackGenerator from './haystack-generator';
import generateKeys from './generate-keys';
import generateHaystack from './generate-haystack';
import extractPathsFromHaystack from './extract-paths-from-haystack';

const uuid = v4;

export default (seed = null) => {
  const rng = PRNG(seed === null ? uuid() : seed);
  const keys = generateKeys(Math.ceil(rng() * 30), rng);
  const haystack = generateHaystack(haystackGenerator({ rng, keys }));
  const paths = extractPathsFromHaystack(haystack);
  return { rng, haystack, paths };
};
