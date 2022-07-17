import jsonpath from 'jsonpath';
import { JSONPath } from 'jsonpath-plus';
import objectScan from '../../../src/index.js';

const commentObjectScan = [
  ' [Depth-first](https://en.wikipedia.org/wiki/Tree_traversal#Depth-first_search) traversal.',
  'See [here](#traversal_order) for details'
].join(' ');
const commentJsonPath = ' [Custom depth-first](https://cs.stackexchange.com/questions/99440) traversal';

export default {
  _index: 3,
  _name: 'Recursive Traversal',
  _fixture: 'tree',
  _comments: {
    jmespath: '[Reference](https://github.com/jmespath/jmespath.py/issues/110)',
    objectScanCompiled: commentObjectScan,
    objectScan: commentObjectScan,
    jsonpath: commentJsonPath,
    jsonpathplus: commentJsonPath
  },
  objectScanCompiled: {
    fn: objectScan(['**']),
    result: [
      ['F', 'G', 'I', 'H'],
      ['F', 'G', 'I'],
      ['F', 'G'],
      ['F', 'B', 'D', 'E'],
      ['F', 'B', 'D', 'C'],
      ['F', 'B', 'D'],
      ['F', 'B', 'A'],
      ['F', 'B'],
      ['F']
    ]

  },
  objectScan: {
    fn: (v) => objectScan(['**'])(v),
    result: [
      ['F', 'G', 'I', 'H'],
      ['F', 'G', 'I'],
      ['F', 'G'],
      ['F', 'B', 'D', 'E'],
      ['F', 'B', 'D', 'C'],
      ['F', 'B', 'D'],
      ['F', 'B', 'A'],
      ['F', 'B'],
      ['F']
    ]
  },
  jsonpath: {
    fn: (v) => jsonpath.paths(v, '$..*'),
    result: [
      ['$', 'F'],
      ['$', 'F', 'B'],
      ['$', 'F', 'G'],
      ['$', 'F', 'B', 'A'],
      ['$', 'F', 'B', 'D'],
      ['$', 'F', 'B', 'D', 'C'],
      ['$', 'F', 'B', 'D', 'E'],
      ['$', 'F', 'G', 'I'],
      ['$', 'F', 'G', 'I', 'H']
    ]
  },
  jsonpathplus: {
    fn: (v) => JSONPath({ path: '$..*', json: v, resultType: 'path' }),
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
