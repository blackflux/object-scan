import suites from './suites.js';

export const iterateSuites = (cb) => {
  const suiteEntries = Object.entries(suites);
  for (let i = 0; i < suiteEntries.length; i += 1) {
    const [suite, tests] = suiteEntries[i];
    cb({ suite, tests });
  }
};

export const iterateTests = (tests, cb) => {
  const testEntries = Object.entries(tests);
  for (let j = 0; j < testEntries.length; j += 1) {
    const [test, fnOrObj] = testEntries[j];
    if (!test.startsWith('_')) {
      const { _result: r, _fixture: fixture } = tests;
      const { fn, result } = typeof fnOrObj === 'function'
        ? { fn: fnOrObj, result: r }
        : fnOrObj;
      // eslint-disable-next-line object-curly-newline
      cb({ test, fn, result, fixture });
    }
  }
};
