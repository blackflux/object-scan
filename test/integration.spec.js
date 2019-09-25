"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chai_1 = require("chai");
// @ts-ignore
const node_tdd_1 = require("node-tdd");
const json_stringify_pretty_compact_1 = __importDefault(require("json-stringify-pretty-compact"));
const index_1 = __importDefault(require("../src/index"));
const getEntries = (source) => fs_1.default.readdirSync(source)
    .map((name) => [name, path_1.default.join(source, name)]);
const getDirectories = (source) => getEntries(source)
    .filter(([f, p]) => fs_1.default.lstatSync(p).isDirectory());
const getFiles = (source) => getEntries(source)
    .filter(([f, p]) => fs_1.default.lstatSync(p).isFile());
const logFn = (type, log, paramsToLog) => (key, value, kwargs) => {
    log.push(Object
        .entries({
        type, key, value, ...kwargs
    })
        .filter(([k, v]) => (paramsToLog || [
        'isMatch', 'matchedBy', 'excludedBy', 'traversedBy'
    ]).concat(['key', 'type']).includes(k))
        .reduce((p, [k, v]) => Object.assign(p, { [k]: v }), {}));
};
node_tdd_1.describe('Integration Testing', () => {
    // eslint-disable-next-line mocha/no-setup-in-describe
    getDirectories(path_1.default.join(__dirname, 'integration'))
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
                    ...options.args,
                    ...(options.log === null ? {} : ['breakFn', 'filterFn']
                        .reduce((p, c) => Object.assign(p, { [c]: logFn(c, log, options.log) }), {}))
                };
                const result = index_1.default(fileContent.needles, opts)(dirInput);
                // eslint-disable-next-line @blackflux/rules/istanbul-prevent-ignore
                /* istanbul ignore if */
                if (fileContent.result === undefined) { // makes it very convenient to record new tests
                    fs_1.default.writeFileSync(filePath, json_stringify_pretty_compact_1.default({ ...fileContent, log, result }));
                }
                else {
                    chai_1.expect(fileContent.result).to.deep.equal(result);
                    chai_1.expect(fileContent.log).to.deep.equal(log);
                }
            });
        });
    });
});
