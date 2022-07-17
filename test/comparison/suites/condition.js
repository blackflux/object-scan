import jsonpath from 'jsonpath';
import jmespath from 'jmespath';
import { JSONPath } from 'jsonpath-plus';
import objectScan from '../../../src/index.js';

export default {
  _index: 2,
  _name: 'Conditional Path',
  _fixture: 'cond',
  _comments: {
    objectScanCompiled: ' Only in code logic',
    objectScan: ' Only in code logic'
  },
  objectScanCompiled: {
    fn: objectScan(['*[*].y'], {
      breakFn: ({ depth, value }) => depth === 2 && value?.x !== 'yes',
      joined: true
    }),
    result: ['a[0].y']
  },
  objectScan: {
    fn: (v) => objectScan(['*[*].y'], {
      breakFn: ({ depth, value }) => depth === 2 && value?.x !== 'yes',
      joined: true
    })(v),
    result: ['a[0].y']
  },
  jsonpath: {
    fn: (v) => jsonpath.paths(v, "$.*[?(@.x == 'yes')].y").map((e) => jsonpath.stringify(e).slice(2)),
    result: ['a[0].y']
  },
  jsonpathplus: {
    fn: (v) => JSONPath({ path: "$.*[?(@.x == 'yes')].y", json: v, resultType: 'path' }),
    result: ["$['a'][0]['y']"]
  },
  jmespath: {
    fn: (v) => jmespath.search(v, "*[?(x == 'yes')].y"),
    result: [[2], []]
  }
};
