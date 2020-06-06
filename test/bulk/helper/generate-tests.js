const assert = require('assert');
const path = require('path');
const generateTest = require('./generate-test');

const conf = require('./generate-tests.conf');

module.exports = ({
  folder,
  count = 1000,
  ...params
}) => {
  assert(typeof folder === 'string');
  assert(Number.isInteger(count) && count > 0);
  assert(params instanceof Object && !Array.isArray(params));

  const entries = Object.entries(conf);

  for (let idx = 0; idx < count; idx += 1) {
    const ps = {};
    const generator = {};
    entries.forEach(([k, v]) => {
      const keys = Object.keys(v);
      const key = keys[Math.floor(Math.random() * keys.length)];
      ps[k] = v[key];
      generator[k] = key;
    });
    generateTest({
      file: path.join(folder, `test${idx}.json`),
      ...ps,
      ...params,
      meta: { generator }
    });
  }
};
