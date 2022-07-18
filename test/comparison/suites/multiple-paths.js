import jmespath from 'jmespath';
import objectScan from '../../../src/index.js';

const jsonpathComment = (
  '[Reference](https://stackoverflow.com/questions/55497833/jsonpath-union-of-multiple-different-paths)'
);

export default {
  _name: 'Multiple Paths',
  _fixture: 'tree',
  _comments: {
    jsonpath: jsonpathComment,
    jsonpathplus: jsonpathComment,
    jmespath: 'Very basic version. Can not detect what matched a result.'
  },
  objectScanCompiled: {
    fn: objectScan(['F.*.I', '*.G.I'], { rtn: ['matchedBy', 'property'] }),
    result: [[['F.*.I', '*.G.I'], 'I']]

  },
  objectScan: {
    fn: (v) => objectScan(['F.*.I', '*.G.I'], { rtn: ['matchedBy', 'property'] })(v),
    result: [[['F.*.I', '*.G.I'], 'I']]
  },
  jmespath: {
    fn: (v) => jmespath.search(v, 'F.*.I || *.G.I'),
    result: [{ H: 3 }]
  }
};
