import blendColors from './blend-colors.js';

const COLORS = [
  [1, '#1f811f'],
  [5, '#dcb517'],
  [10, '#d96a0f'],
  [20, '#b01414']
];

export default (value) => {
  if (value <= COLORS[0][0]) {
    return COLORS[0][1];
  }
  if (value >= COLORS[COLORS.length - 1][0]) {
    return COLORS[COLORS.length - 1][1];
  }
  const colorIndex = COLORS.findIndex(([idx]) => value <= idx);
  const c1 = COLORS[colorIndex - 1];
  const c2 = COLORS[colorIndex];
  const factor = Math.min(1, Math.max(0, Math.abs(
    (value - c1[0]) / (c2[0] - c1[0])
  )));
  return blendColors(c1[1], c2[1], factor);
};
