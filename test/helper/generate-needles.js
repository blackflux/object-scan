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
  groupModifierParams,
  needleArrayProbability
}) => {
  const needles = useArraySelector ? paths : stripArraySelectorFromPaths(paths);
  const needlesShuffled = shuffleArray(needles, rng);
  const needlePaths = [];
  const needleArrays = [];
  needlesShuffled.forEach((p) => {
    if (rng() < needleArrayProbability) {
      needleArrays.push(p);
    } else {
      needlePaths.push(pathToNeedlePath(p, pathModifierParams(p), rng));
    }
  });
  const needlesParsed = needlePathsToNeedlesParsed(needlePaths);
  const result = parsedNeedleToStringArray(needlesParsed, groupModifierParams(), rng);
  result.push(...needleArrays);
  shuffleArray(result, rng);
  return result;
};
