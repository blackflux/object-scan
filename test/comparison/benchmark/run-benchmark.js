import * as fixtures from '../fixtures.js';

const COUNT = 1000;

// todo: discard outlier
export default (fn, fixture) => {
  const start = process.hrtime();
  for (let k = 0; k < COUNT; k += 1) {
    fn(fixtures[fixture]);
  }
  const stop = process.hrtime(start);
  return (stop[0] * 1e9 + stop[1]) / (COUNT * 1000);
};
