import objectScan from '../../../src/index.js';

export default {
  _name: 'Auto Traverse',
  _fixture: 'array',
  _result: [[1, 1], [1, 0, 'a'], [1, 0], [0]],
  objectScanCompiled: objectScan(['**(^a$)'], { useArraySelector: false }),
  objectScan: (v) => objectScan(['**(^a$)'], { useArraySelector: false })(v)
};
