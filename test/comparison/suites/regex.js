import { JSONPath } from 'jsonpath-plus';
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
  }
};
