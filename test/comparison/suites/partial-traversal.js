import jsonpath from 'jsonpath';
import { JSONPath } from 'jsonpath-plus';
import Nimma from 'nimma';
import objectScan from '../../../src/index.js';

export default {
  _name: 'Partial Traversal',
  _fixture: 'rec',
  objectScanCompiled: {
    fn: objectScan(['a.b.a.b.a.**.b']),
    result: [
      ['a', 'b', 'a', 'b', 'a', 'b', 'b', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'a', 'a', 'b']
    ]
  },
  objectScan: {
    fn: objectScan(['a.b.a.b.a.**.b']),
    result: [
      ['a', 'b', 'a', 'b', 'a', 'b', 'b', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'a', 'a', 'b']
    ]
  },
  jsonpath: {
    fn: (v) => jsonpath.paths(v, '$.a.b.a.b.a..b'),
    result: [
      ['$', 'a', 'b', 'a', 'b', 'a', 'b'],
      ['$', 'a', 'b', 'a', 'b', 'a', 'a', 'b'],
      ['$', 'a', 'b', 'a', 'b', 'a', 'a', 'a', 'b'],
      ['$', 'a', 'b', 'a', 'b', 'a', 'a', 'b', 'b'],
      ['$', 'a', 'b', 'a', 'b', 'a', 'b', 'b'],
      ['$', 'a', 'b', 'a', 'b', 'a', 'b', 'a', 'b'],
      ['$', 'a', 'b', 'a', 'b', 'a', 'b', 'b', 'b']
    ]
  },
  jsonpathplus: {
    fn: (v) => JSONPath({ path: '$.a.b.a.b.a..b', json: v, resultType: 'path' }),
    result: [
      "$['a']['b']['a']['b']['a']['b']",
      "$['a']['b']['a']['b']['a']['a']['b']",
      "$['a']['b']['a']['b']['a']['a']['a']['b']",
      "$['a']['b']['a']['b']['a']['a']['b']['b']",
      "$['a']['b']['a']['b']['a']['b']['b']",
      "$['a']['b']['a']['b']['a']['b']['a']['b']",
      "$['a']['b']['a']['b']['a']['b']['b']['b']"
    ]
  },
  nimma: {
    fn: (v) => {
      const result = [];
      new Nimma(['$.a.b.a.b.a..b']).query(v, {
        '$.a.b.a.b.a..b': ({ path }) => {
          result.push(path.slice(0));
        }
      });
      return result;
    },
    result: [
      ['a', 'b', 'a', 'b', 'a', 'a', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b', 'b', 'b']
    ]
  },
  nimmaCompiled: {
    fn: (() => {
      const n = new Nimma(['$.a.b.a.b.a..b']);
      return (v) => {
        const result = [];
        n.query(v, {
          '$.a.b.a.b.a..b': ({ path }) => {
            result.push(path.slice(0));
          }
        });
        return result;
      };
    })(),
    result: [
      ['a', 'b', 'a', 'b', 'a', 'a', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b', 'b'],
      ['a', 'b', 'a', 'b', 'a', 'b', 'b', 'b']
    ]
  }
};
