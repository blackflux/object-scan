const expect = require('chai').expect;
const { describe } = require('node-tdd');
const haystackGenerator = require('./helper/haystack-generator');
const generateHaystack = require('./helper/generate-haystack');
const extractPathsFromHaystack = require('./helper/extract-paths-from-haystack');
const needlePathsToNeedlesParsed = require('./helper/needle-paths-to-needles-parsed');
const pathToNeedlePath = require('./helper/path-to-needle-path');
const parsedNeedleToString = require('./helper/parsed-needle-to-string');
const objectScan = require('../src/index');

describe('Testing bulk related', () => {
  it('Testing all needles matched', () => {
    for (let idx = 0; idx < 100; idx += 1) {
      const haystack = generateHaystack(haystackGenerator());
      const paths = extractPathsFromHaystack(haystack);
      if (paths.length !== 0) {
        const needlePaths = paths.map((p) => pathToNeedlePath(p, {
          exclude: false,
          lenPercentage: 1,
          questionMark: 0,
          partialStar: 0,
          singleStar: 0,
          doubleStar: 0
        }));

        const needles = needlePathsToNeedlesParsed(needlePaths);
        const str = parsedNeedleToString(needles);
        const matches = objectScan([str])(haystack);
        expect(paths).to.deep.equal(matches.reverse());
      }
    }
  });
});
