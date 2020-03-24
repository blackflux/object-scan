const assert = require('assert');
const fs = require('smart-fs');
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
    const file = path.join(folder, `test${idx}.json`);
    const test = generateTest(params);
    if (!fs.existsSync(file)) {
      fs.smartWrite(file, test);
    }
  }
};
