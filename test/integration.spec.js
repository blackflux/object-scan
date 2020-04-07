const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const stringify = require('json-stringify-pretty-compact');
const objectScan = require('../src/index');

const getEntries = (source) => fs.readdirSync(source)
  .map((name) => [name, path.join(source, name)]);
const getDirectories = (source) => getEntries(source)
  .filter(([f, p]) => fs.lstatSync(p).isDirectory());
const getFiles = (source) => getEntries(source)
  .filter(([f, p]) => fs.lstatSync(p).isFile());

const logFn = (type, log, paramsToLog) => (kwargs) => {
  log.push(Object
    .keys(kwargs)
    .filter((k) => (paramsToLog || ['isMatch', 'matchedBy', 'excludedBy', 'traversedBy']).includes(k))
    .reduce((p, k) => Object.assign(p, {
      [k]: kwargs[k]
    }), { type, key: kwargs.key }));
};

describe('Integration Testing', () => {
  // eslint-disable-next-line mocha/no-setup-in-describe
  getDirectories(path.join(__dirname, 'integration'))
    // eslint-disable-next-line import/no-dynamic-require,global-require
    .map(([dirName, dirPath]) => [dirName, dirPath, require(`${dirPath}.json`)])
    .forEach(([dirName, dirPath, dirInput]) => {
      getFiles(dirPath)
        .filter(([fileName, filePath]) => fileName.endsWith('.spec.json'))
        // eslint-disable-next-line import/no-dynamic-require,global-require
        .map(([fileName, filePath]) => [fileName, filePath, require(filePath)])
        .forEach(([fileName, filePath, fileContent]) => {
          it(`Testing ${dirName}/${fileName}`, () => {
            const options = fileContent.options || {};
            const log = options.log === null ? null : [];
            const opts = {
              joined: true,
              ...options.args,
              ...(options.log === null ? {} : ['breakFn', 'filterFn']
                .reduce((p, c) => Object.assign(p, { [c]: logFn(c, log, options.log) }), {}))
            };
            const result = objectScan(fileContent.needles, opts)(dirInput);
            // eslint-disable-next-line @blackflux/rules/istanbul-prevent-ignore
            /* istanbul ignore if */
            if (fileContent.result === undefined) { // makes it very convenient to record new tests
              fs.writeFileSync(filePath, stringify({ ...fileContent, log, result }));
            } else {
              expect(fileContent.result).to.deep.equal(result);
              expect(fileContent.log).to.deep.equal(log);
            }
          });
        });
    });
});
