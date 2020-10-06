const shuffleArray = require('./shuffle-array');
const needlePathsToNeedlesParsed = require('./needle-paths-to-needles-parsed');
const pathToNeedlePath = require('./path-to-needle-path');
const parsedNeedleToStringArray = require('./parsed-needle-to-string-array');
const stripArraySelectorFromPaths = require('./strip-array-selector-from-paths');

module.exports = ({
  rng, paths, useArraySelector, modifierParams
}) => {
  const needles = useArraySelector ? paths : stripArraySelectorFromPaths(paths);
  const needlesShuffled = shuffleArray(needles, rng);
  const needlePaths = needlesShuffled.map((p) => pathToNeedlePath(p, modifierParams(p), rng));
  const needlesParsed = needlePathsToNeedlesParsed(needlePaths);
  return parsedNeedleToStringArray(needlesParsed);
};
