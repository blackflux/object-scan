import { JSONPath } from 'jsonpath-plus';
import objectScan from '../../../src/index.js';

export default {
  _index: 5,
  _name: 'Get Parent',
  _fixture: 'cond',
  _result: [
    { x: 'no', y: 1 },
    { x: 'no', y: 1 },
    [{ x: 'no', y: 1 }],
    { a: [{ x: 'yes', y: 2 }], b: [{ x: 'no', y: 1 }] },
    { x: 'yes', y: 2 },
    { x: 'yes', y: 2 },
    [{ x: 'yes', y: 2 }],
    { a: [{ x: 'yes', y: 2 }], b: [{ x: 'no', y: 1 }] }
  ],
  objectScanCompiled: objectScan(['**'], {
    rtn: 'parent'
  }),
  objectScan: (v) => objectScan(['**'], {
    rtn: 'parent'
  })(v),
  jsonpathplus: {
    fn: (v) => JSONPath({ path: '$..*', json: v, resultType: 'parent' }),
    result: [
      { a: [{ x: 'yes', y: 2 }], b: [{ x: 'no', y: 1 }] },
      { a: [{ x: 'yes', y: 2 }], b: [{ x: 'no', y: 1 }] },
      [{ x: 'yes', y: 2 }],
      { x: 'yes', y: 2 },
      { x: 'yes', y: 2 },
      [{ x: 'no', y: 1 }],
      { x: 'no', y: 1 },
      { x: 'no', y: 1 }
    ]
  }
};
