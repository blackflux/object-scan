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
        .filter(([test]) => !test.startsWith('_'))
        .forEach(([test, fnOrObj]) => {
          it(`Testing ${test}`, () => {
            const { _result: r, _fixture: fixture } = tests;
            const { fn, result } = typeof fnOrObj === 'function'
              ? { fn: fnOrObj, result: r }
              : fnOrObj;
            const fnResult = fn(fixtures[fixture]);
            expect(fnResult, JSON.stringify(fnResult)).to.deep.equal(result);
          });
        });
    });
  });
});
