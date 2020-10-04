module.exports = (a, rng = Math.random) => {
  const result = [...a];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    // eslint-disable-next-line no-param-reassign
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
