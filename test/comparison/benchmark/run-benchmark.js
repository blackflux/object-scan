import * as fixtures from '../fixtures.js';
import suites from '../suites.js';

const COUNT = 1000;
const trim = 0.25;

export default (suite, test, fixture) => {
  const times = Array(COUNT);
  const fnOrObj = suites[suite][test];
  const fn = typeof fnOrObj === 'function' ? fnOrObj : fnOrObj.fn;
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
