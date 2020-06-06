const fs = require('smart-fs');
const path = require('path');

const lowBoolProp = () => ({
  never: () => () => false,
  few: () => () => Math.random() < 0.2
});

const boolProb = () => ({
  never: () => () => false,
  some: () => () => Math.random() < 0.5,
  always: () => () => true
});

const intProb = (min, max) => ({
  min: () => () => min,
  few: () => () => Math.round(min + (max - min) * (Math.random() * 0.25)),
  some: () => () => Math.round(min + (max - min) * (0.4 + Math.random() * 0.2)),
  many: () => () => Math.round(min + (max - min) * (0.75 + Math.random() * 0.25)),
  max: () => () => max
});

module.exports = {
  keySets: fs
    .walkDir(path.join(__dirname, '..', 'resources', 'key-sets'))
    .reduce((p, f) => Object.assign(p, {
      [f.split('.')[0]]: [fs.smartRead(path.join(__dirname, '..', 'resources', 'key-sets', f))]
    }), {}),
  arrayProb: boolProb(),
  objectLengthProb: intProb(0, 30),
  arrayLengthProb: intProb(0, 30),
  maxDepthProb: intProb(1, 20),
  maxNeedlesProb: intProb(1, 20),
  maxNeedleLengthProb: intProb(1, 20),
  negateProb: lowBoolProp(),
  starProb: boolProb(),
  doubleStarProb: boolProb(),
  emptyNeedleProb: lowBoolProp(),
  useArraySelectorProb: lowBoolProp(),
  partialStarProb: lowBoolProp(),
  questionMarkProb: lowBoolProp()
};
