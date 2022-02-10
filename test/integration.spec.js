import fs from 'smart-fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { describe } from 'node-tdd';
import stringify from 'json-stringify-pretty-compact';
import { expect } from 'chai';
import objectScan from '../src/index.js';

const getEntries = (source) => fs.readdirSync(source)
  .map((name) => [name, join(source, name)]);
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
  getDirectories(join(dirname(fileURLToPath(import.meta.url)), 'integration'))
    .map(([dirName, dirPath]) => [dirName, dirPath, fs.smartRead(`${dirPath}.json`)])
    .forEach(([dirName, dirPath, dirInput]) => {
      getFiles(dirPath)
        .filter(([fileName, filePath]) => fileName.endsWith('.spec.json'))
        .map(([fileName, filePath]) => [fileName, filePath, fs.smartRead(filePath)])
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
            // eslint-disable-next-line @blackflux/rules/c8-prevent-ignore
            /* c8 ignore next 3 */
            if (fileContent.result === undefined) {
              // makes it very convenient to record new tests
              fs.writeFileSync(filePath, stringify({ ...fileContent, log, result }));
            } else {
              expect(fileContent.result).to.deep.equal(result);
              expect(fileContent.log).to.deep.equal(log);
            }
          });
        });
    });
});
