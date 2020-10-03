const sampleArray = require('./sample-array');
const words = require('./resources/words.json');
const chars = require('./resources/chars.json');

module.exports = (count, rng = Math.random) => {
  const result = sampleArray(words, count, { rng, unique: true });
  const noiseProb = rng();
  const noiseFactor = Math.ceil(rng() * 5);
  return result
    .map((e) => e.split(''))
    .map((e) => {
      if (noiseProb < rng()) {
        const noiseCount = Math.ceil(e.length * (rng() ** noiseFactor));
        const noiseChars = sampleArray(chars, noiseCount, { rng, unique: true });
        const noiseTargets = sampleArray([...Array(e.length).keys()], noiseCount, { rng, unique: true });
        noiseTargets.forEach((targetIdx, replacementIdx) => {
          e[targetIdx] = noiseChars[replacementIdx];
        });
      }
      return e;
    })
    .map((e) => e.join(''));
};
