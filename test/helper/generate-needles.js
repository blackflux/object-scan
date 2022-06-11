import shuffleArray from './shuffle-array.js';
import needlePathsToNeedlesParsed from './needle-paths-to-needles-parsed.js';
import pathToNeedlePath from './path-to-needle-path.js';
import parsedNeedleToStringArray from './parsed-needle-to-string-array.js';
import stripArraySelectorFromPaths from './strip-array-selector-from-paths.js';

export default ({
  rng,
  paths,
  useArraySelector,
  pathModifierParams,
  groupModifierParams
}) => {
  const needles = useArraySelector ? paths : stripArraySelectorFromPaths(paths);
  const needlesShuffled = shuffleArray(needles, rng);
  const needlePaths = needlesShuffled.map((p) => pathToNeedlePath(p, pathModifierParams(p), rng));
  const needlesParsed = needlePathsToNeedlesParsed(needlePaths);
  return parsedNeedleToStringArray(needlesParsed, groupModifierParams(), rng);
};
