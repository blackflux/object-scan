import * as fixtures from '../fixtures.js';

const COUNT = 1000;
const trim = 0.25;

export default (fn, fixture) => {
  const times = Array(COUNT);
  for (let k = 0; k < COUNT; k += 1) {
    const start = process.hrtime();
    fn(fixtures[fixture]);
    const stop = process.hrtime(start);
    times[k] = stop[0] * 1e9 + stop[1];
  }
  times.sort();
  const timesRelevant = times.slice(COUNT * trim, COUNT * (1 - trim));
  return timesRelevant.reduce((a, b) => a + b, 0) / (timesRelevant.length * 1000.0);
};
