import jsonpath from 'jsonpath';
import { JSONPath } from 'jsonpath-plus';
import objectScan from '../../../src/index.js';

export default {
  _index: 3,
  _name: 'Recursive Traversal',
  _fixture: 'tree',
  _comments: {
    jmespath: '[Reference](https://github.com/jmespath/jmespath.py/issues/110)',
    objectScanCompiled: ' [Depth-first](https://en.wikipedia.org/wiki/Tree_traversal#Depth-first_search) traversal',
    objectScan: ' [Depth-first](https://en.wikipedia.org/wiki/Tree_traversal#Depth-first_search) traversal',
    jsonpath: ' [Custom depth-first](https://cs.stackexchange.com/questions/99440) traversal',
    jsonpathplus: ' [Custom depth-first](https://cs.stackexchange.com/questions/99440) traversal'
  },
  objectScanCompiled: {
    fn: objectScan(['**'], {
      reverse: false,
      joined: true
    }),
    result: [
      'F.B.A',
      'F.B.D.C',
      'F.B.D.E',
      'F.B.D',
      'F.B',
      'F.G.I.H',
      'F.G.I',
      'F.G',
      'F'
    ]
  },
  objectScan: {
    fn: (v) => objectScan(['**'], {
      reverse: false,
      joined: true
    })(v),
    result: [
      'F.B.A',
      'F.B.D.C',
      'F.B.D.E',
      'F.B.D',
      'F.B',
      'F.G.I.H',
      'F.G.I',
      'F.G',
      'F'
    ]
  },
  jsonpath: {
    fn: (v) => jsonpath.paths(v, '$..[*]').map((e) => jsonpath.stringify(e).slice(2)),
    result: [
      'F',
      'F.B',
      'F.G',
      'F.B.A',
      'F.B.D',
      'F.B.D.C',
      'F.B.D.E',
      'F.G.I',
      'F.G.I.H'
    ]
  },
  jsonpathplus: {
    fn: (v) => JSONPath({ path: '$..[*]', json: v, resultType: 'path' }),
    result: [
      "$['F']",
      "$['F']['B']",
      "$['F']['G']",
      "$['F']['B']['A']",
      "$['F']['B']['D']",
      "$['F']['B']['D']['C']",
      "$['F']['B']['D']['E']",
      "$['F']['G']['I']",
      "$['F']['G']['I']['H']"
    ]
  }
};
