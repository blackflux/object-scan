const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const objectScan = require('../src/index');

const getEntries = source => fs.readdirSync(source)
  .map(name => [name, path.join(source, name)]);
const getDirectories = source => getEntries(source)
  .filter(([f, p]) => fs.lstatSync(p).isDirectory());
const getFiles = source => getEntries(source)
  .filter(([f, p]) => fs.lstatSync(p).isFile());

const logFn = (type, log, recording) => (key, value, kwargs) => {
  log.push(Object
    .entries(Object.assign({ type, key, value }, kwargs))
    .filter(([k, v]) => recording.concat(['key', 'type']).includes(k))
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
            const log = [];
            const opts = Object.assign({}, fileContent.opts, {
              breakFn: logFn('breakFn', log, fileContent.recording || ['isMatch', 'matchedBy', 'traversedBy']),
              filterFn: logFn('filterFn', log, fileContent.recording || ['isMatch', 'matchedBy', 'traversedBy'])
            });
            const result = objectScan(fileContent.needles, opts)(dirInput);
            // fs.writeFileSync(filePath, JSON.stringify(Object
            //   .assign({}, fileContent, { log, result }), null, 2));
            expect(fileContent.result).to.deep.equal(result);
            expect(fileContent.log).to.deep.equal(log);
          });
        });
    });
});
