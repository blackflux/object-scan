import jmespath from 'jmespath';
import jsonpath from 'jsonpath';
import objectScan from '../../../src/index.js';

export default {
  fixture: 'cond',
  result: 2,
  objectScanCompiled: objectScan(['a[0].y'], {
    rtn: 'value',
    abort: true
  }),
  objectScan: (v) => objectScan(['a[0].y'], {
    rtn: 'value',
    abort: true
  })(v),
  jsonpath: (v) => jsonpath.value(v, '$.a[0].y'),
  jmespath: (v) => jmespath.search(v, 'a[0].y')
};
