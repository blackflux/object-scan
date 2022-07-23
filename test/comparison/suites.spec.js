import { describe } from 'node-tdd';
import { expect } from 'chai';
import { iterateSuites, iterateTests } from './iterator.js';
import * as fixtures from './fixtures.js';

describe('Testing suites', () => {
  // eslint-disable-next-line mocha/no-setup-in-describe
  iterateSuites(({ suite, tests }) => {
    describe(`Suite ${suite}`, () => {
      // eslint-disable-next-line mocha/no-setup-in-describe,object-curly-newline
      iterateTests(tests, ({ test, fn, fixture, result }) => {
        if (fn) {
          it(`Testing ${test}`, () => {
            const fnResult = fn(fixtures[fixture]);
            expect(fnResult, JSON.stringify(fnResult)).to.deep.equal(result);
          });
        }
      });
    });
  });
});
