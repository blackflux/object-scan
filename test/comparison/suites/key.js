import jsonpath from 'jsonpath';
import objectScan from '../../../src/index.js';

export default {
  _name: 'Get Key',
  _fixture: 'cond',
  _result: ['a[0].y', 'b[0].y'],
  objectScanCompiled: objectScan(['*[*].y'], { joined: true, reverse: false }),
  objectScan: (v) => objectScan(['*[*].y'], { joined: true, reverse: false })(v),
  jsonpath: (v) => jsonpath.paths(v, '$.*[*].y').map((e) => jsonpath.stringify(e).slice(2))
};
