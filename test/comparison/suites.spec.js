import { describe } from 'node-tdd';
import { expect } from 'chai';
import * as fixtures from './fixtures.js';
import * as suites from './suites.js';

describe('Testing suites', () => {
  // eslint-disable-next-line mocha/no-setup-in-describe
  Object.entries(suites).forEach(([suite, tests]) => {
    describe(`Testing suite ${suite}`, () => {
      // eslint-disable-next-line mocha/no-setup-in-describe
      Object.entries(tests)
        .filter(([test]) => !['fixture', 'result'].includes(test))
        .forEach(([test, fnOrArray]) => {
          it(`Testing Test ${test}`, () => {
            const isArray = Array.isArray(fnOrArray);
            const fn = isArray ? fnOrArray[0] : fnOrArray;
            const result = isArray ? fnOrArray[1] : tests.result;
            expect(fn(fixtures[tests.fixture])).to.deep.equal(result);
          });
        });
    });
  });
});
