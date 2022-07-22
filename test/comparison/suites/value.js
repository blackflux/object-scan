import jmespath from 'jmespath';
import jsonpath from 'jsonpath';
import { JSONPath } from 'jsonpath-plus';
import objectScan from '../../../src/index.js';

export default {
  _name: 'Get Value',
  _fixture: 'cond',
  _result: 2,
  objectScanCompiled: objectScan(['a[0].y'], {
    rtn: 'value',
    abort: true
  }),
  objectScan: (v) => objectScan(['a[0].y'], {
    rtn: 'value',
    abort: true
  })(v),
  jsonpath: (v) => jsonpath.value(v, '$.a[0].y'),
  jsonpathplus: {
    fn: (v) => JSONPath({ path: '$.a[0].y', json: v }),
    result: [2]
  },
  jmespath: (v) => jmespath.search(v, 'a[0].y')
};
