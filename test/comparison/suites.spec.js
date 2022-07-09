import { describe } from 'node-tdd';
import { expect } from 'chai';
import * as fixtures from './fixtures.js';
import * as suites from './suites.js';

describe('Testing suites', () => {
  // eslint-disable-next-line mocha/no-setup-in-describe
  Object.entries(suites).forEach(([suite, tests]) => {
    describe(`Suite ${suite}`, () => {
      // eslint-disable-next-line mocha/no-setup-in-describe
      Object.entries(tests)
        .filter(([test]) => !['fixture', 'result'].includes(test))
        .forEach(([test, fnOrObj]) => {
          it(`Testing ${test}`, () => {
            const { fn, result } = typeof fnOrObj === 'function'
              ? { fn: fnOrObj, result: tests.result }
              : fnOrObj;
            expect(fn(fixtures[tests.fixture])).to.deep.equal(result);
          });
        });
    });
  });
});
