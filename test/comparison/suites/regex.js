import { JSONPath } from 'jsonpath-plus';
import Nimma from 'nimma';
import objectScan from '../../../src/index.js';

export default {
  _name: 'Regex',
  _fixture: 'foo',
  objectScanCompiled: {
    fn: objectScan(['entries.(fo+bar)']),
    result: [['entries', 'fooooobar'], ['entries', 'foobar']]
  },
  objectScan: {
    fn: (v) => objectScan(['entries.(fo+bar)'])(v),
    result: [['entries', 'fooooobar'], ['entries', 'foobar']]
  },
  jsonpathplus: {
    fn: (v) => JSONPath({ path: '$.entries.[?(@property.match(/fo+bar/))]', json: v, resultType: 'path' }),
    result: [
      "$['entries']['foobar']",
      "$['entries']['fooooobar']"
    ]
  },
  nimma: {
    fn: (v) => {
      const result = [];
      new Nimma(['$.entries.[?(@property.match(/fo+bar/))]']).query(v, {
        '$.entries.[?(@property.match(/fo+bar/))]': ({ path }) => {
          result.push(path.slice(0));
        }
      });
      return result;
    },
    result: [['entries', 'foobar'], ['entries', 'fooooobar']]
  },
  nimmaCompiled: {
    fn: (() => {
      const n = new Nimma(['$.entries.[?(@property.match(/fo+bar/))]']);
      return (v) => {
        const result = [];
        n.query(v, {
          '$.entries.[?(@property.match(/fo+bar/))]': ({ path }) => {
            result.push(path.slice(0));
          }
        });
        return result;
      };
    })(),
    result: [['entries', 'foobar'], ['entries', 'fooooobar']]
  }
};
