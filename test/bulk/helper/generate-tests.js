const assert = require('assert');
const path = require('path');
const generateTest = require('./generate-test');

module.exports = ({
  folder,
  count = 100,
  ...params
}) => {
  assert(typeof folder === 'string');
  assert(Number.isInteger(count) && count > 0);
  assert(params instanceof Object && !Array.isArray(params));
  for (let idx = 0; idx < count; idx += 1) {
    generateTest({
      file: path.join(folder, `test${idx}.json`),
      ...params
    });
  }
};
