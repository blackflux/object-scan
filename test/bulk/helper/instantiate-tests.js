const assert = require('assert');
const fs = require('smart-fs');
const path = require('path');
const expect = require('chai').expect;
const isEqual = require('lodash.isequal');
const objectScan = require('../../../src');
const { compile } = require('../../../src/util/compiler');

const { compare } = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

module.exports = ({
  folder,
  init = false
}) => {
  assert(typeof folder === 'string');
  assert(typeof init === 'boolean');
  fs
    .walkDir(folder)
    .sort(compare)
    .forEach((f) => {
      it(`Testing Bulk ${f}`, () => {
        const testFile = path.join(folder, f);
        const data = fs.smartRead(testFile);
        const { needles, haystack } = data;
        const logs = [];
        const opts = {
          joined: true,
          strict: false,
          ...['breakFn', 'filterFn']
            .reduce((prev, type) => Object.assign(prev, {
              [type]: (key, value, {
                isMatch, matchedBy, excludedBy, traversedBy
              }) => logs.push({
                type, key, isMatch, matchedBy, excludedBy, traversedBy
              })
            }), {})
        };
        const result = objectScan(needles, opts)(haystack);
        const newData = {
          needles,
          searchTree: JSON.parse(JSON.stringify(compile(needles, false))),
          result,
          logs,
          haystack
        };
        if (!isEqual(data, newData)) {
          expect(fs.smartWrite(testFile, newData, { keepOrder: false })).to.equal(init);
        }
      });
    });
};
