import jsonpath from 'jsonpath';
import { JSONPath } from 'jsonpath-plus';
import Nimma from 'nimma';
import objectScan from '../../../src/index.js';

export default {
  _name: 'Get Key',
  _fixture: 'cond',
  objectScanCompiled: {
    fn: objectScan(['*[*].y']),
    result: [
      ['b', 0, 'y'],
      ['a', 0, 'y']
    ]
  },
  objectScan: {
    fn: (v) => objectScan(['*[*].y'])(v),
    result: [
      ['b', 0, 'y'],
      ['a', 0, 'y']
    ]
  },
  jsonpath: {
    fn: (v) => jsonpath.paths(v, '$.*[*].y'),
    result: [
      ['$', 'a', 0, 'y'],
      ['$', 'b', 0, 'y']
    ]
  },
  jsonpathplus: {
    fn: (v) => JSONPath({ path: '$.*[*].y', json: v, resultType: 'path' }),
    result: ["$['a'][0]['y']", "$['b'][0]['y']"]
  },
  nimma: {
    fn: (v) => {
      const result = [];
      new Nimma(['$.*[*].y']).query(v, {
        '$.*[*].y': ({ path }) => {
          result.push(path.slice(0));
        }
      });
      return result;
    },
    result: [
      ['a', 0, 'y'],
      ['b', 0, 'y']
    ]
  },
  nimmaCompiled: {
    fn: (() => {
      const n = new Nimma(['$.*[*].y']);
      return (v) => {
        const result = [];
        n.query(v, {
          '$.*[*].y': ({ path }) => {
            result.push(path.slice(0));
          }
        });
        return result;
      };
    })(),
    result: [
      ['a', 0, 'y'],
      ['b', 0, 'y']
    ]
  }
};
