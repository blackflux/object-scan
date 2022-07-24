import jsonpath from 'jsonpath';
import { JSONPath } from 'jsonpath-plus';
import Nimma from 'nimma';
import objectScan from '../../../src/index.js';

const commentObjectScan = [
  '[Depth-first](https://en.wikipedia.org/wiki/Tree_traversal#Depth-first_search) traversal.',
  'See [here](#traversal_order) for details'
].join(' ');
const commentJsonPath = '[Custom depth-first](https://cs.stackexchange.com/questions/99440) traversal';
const commentNimma = (
  '[Depth-first](https://en.wikipedia.org/wiki/Tree_traversal#Depth-first_search) traversal in in Pre-order'
);

export default {
  _name: 'Recursive Traversal',
  _fixture: 'tree',
  objectScanCompiled: {
    comment: commentObjectScan,
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
    comment: commentObjectScan,
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
  jmespath: {
    comment: '[Reference](https://github.com/jmespath/jmespath.py/issues/110)'
  },
  jsonpath: {
    comment: commentJsonPath,
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
    comment: commentJsonPath,
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
  },
  nimma: {
    comment: commentNimma,
    fn: (v) => {
      const result = [];
      new Nimma(['$..*']).query(v, {
        '$..*': ({ path }) => {
          result.push(path.slice(0));
        }
      });
      return result;
    },
    result: [
      ['F'],
      ['F', 'B'],
      ['F', 'B', 'A'],
      ['F', 'B', 'D'],
      ['F', 'B', 'D', 'C'],
      ['F', 'B', 'D', 'E'],
      ['F', 'G'],
      ['F', 'G', 'I'],
      ['F', 'G', 'I', 'H']
    ]
  },
  nimmaCompiled: {
    comment: commentNimma,
    fn: (() => {
      const n = new Nimma(['$..*']);
      return (v) => {
        const result = [];
        n.query(v, {
          '$..*': ({ path }) => {
            result.push(path.slice(0));
          }
        });
        return result;
      };
    })(),
    result: [
      ['F'],
      ['F', 'B'],
      ['F', 'B', 'A'],
      ['F', 'B', 'D'],
      ['F', 'B', 'D', 'C'],
      ['F', 'B', 'D', 'E'],
      ['F', 'G'],
      ['F', 'G', 'I'],
      ['F', 'G', 'I', 'H']
    ]
  }
};
