const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const stringify = require('json-stringify-pretty-compact');
const objectScan = require('../src/index');

const getEntries = source => fs.readdirSync(source)
  .map(name => [name, path.join(source, name)]);
const getDirectories = source => getEntries(source)
  .filter(([f, p]) => fs.lstatSync(p).isDirectory());
const getFiles = source => getEntries(source)
  .filter(([f, p]) => fs.lstatSync(p).isFile());

const logFn = (type, log, paramsToLog) => (key, value, kwargs) => {
  log.push(Object
    .entries(Object.assign({ type, key, value }, kwargs))
    .filter(([k, v]) => (paramsToLog || [
      'isMatch', 'matchedBy', 'excludedBy', 'traversedBy'
    ]).concat(['key', 'type']).includes(k))
    .reduce((p, [k, v]) => Object.assign(p, { [k]: v }), {}));
};

describe('Integration Testing', () => {
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
            const opts = Object.assign({}, options.args, options.log === null ? {} : ['breakFn', 'filterFn']
              .reduce((p, c) => Object.assign(p, { [c]: logFn(c, log, options.log) }), {}));
            const result = objectScan(fileContent.needles, opts)(dirInput);
            // eslint-disable-next-line @blackflux/rules/istanbul-prevent-ignore
            /* istanbul ignore if */
            if (fileContent.result === undefined) { // makes it very convenient to record new tests
              fs.writeFileSync(filePath, stringify(Object.assign({}, fileContent, { log, result })));
            } else {
              expect(fileContent.result).to.deep.equal(result);
              expect(fileContent.log).to.deep.equal(log);
            }
          });
        });
    });
});
