import objectScan from '../../../src/index.js';

const jsonpathComment = (
  '[Reference](https://stackoverflow.com/questions/55497833/jsonpath-union-of-multiple-different-paths)'
);

export default {
  _name: 'Multiple Paths',
  _fixture: 'tree',
  _comments: {
    jsonpath: jsonpathComment,
    jsonpathplus: jsonpathComment
  },
  objectScanCompiled: {
    fn: objectScan(['F.*.I', '*.G.I'], { rtn: ['matchedBy', 'property'] }),
    result: [[['F.*.I', '*.G.I'], 'I']]

  },
  objectScan: {
    fn: (v) => objectScan(['F.*.I', '*.G.I'], { rtn: ['matchedBy', 'property'] })(v),
    result: [[['F.*.I', '*.G.I'], 'I']]
  }
};
