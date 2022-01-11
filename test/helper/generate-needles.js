import shuffleArray from './shuffle-array';
import needlePathsToNeedlesParsed from './needle-paths-to-needles-parsed';
import pathToNeedlePath from './path-to-needle-path';
import parsedNeedleToStringArray from './parsed-needle-to-string-array';
import stripArraySelectorFromPaths from './strip-array-selector-from-paths';

export default ({
  rng, paths, useArraySelector, modifierParams
}) => {
  const needles = useArraySelector ? paths : stripArraySelectorFromPaths(paths);
  const needlesShuffled = shuffleArray(needles, rng);
  const needlePaths = needlesShuffled.map((p) => pathToNeedlePath(p, modifierParams(p), rng));
  const needlesParsed = needlePathsToNeedlesParsed(needlePaths);
  return parsedNeedleToStringArray(needlesParsed);
};
