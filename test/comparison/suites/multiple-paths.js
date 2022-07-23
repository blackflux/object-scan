import objectScan from '../../../src/index.js';

const jsonpathComment = (
  '[Reference](https://stackoverflow.com/questions/55497833/jsonpath-union-of-multiple-different-paths)'
);

export default {
  _name: 'Multiple Paths',
  _fixture: 'tree',
  _result: [[['F.*.I', '*.G.I'], 'I'], [['*.*.A'], 'A']],
  objectScanCompiled: objectScan(['F.*.I', '*.G.I', '*.*.A'], { rtn: ['matchedBy', 'property'] }),
  objectScan: (v) => objectScan(['F.*.I', '*.G.I', '*.*.A'], { rtn: ['matchedBy', 'property'] })(v),
  jsonpath: {
    comment: jsonpathComment
  },
  jsonpathplus: {
    comment: jsonpathComment
  }
};
