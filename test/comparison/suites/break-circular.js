import objectScan from '../../../src/index.js';

export default {
  _name: 'Break Circular',
  _fixture: 'recsimple',
  objectScanCompiled: {
    fn: objectScan(['**'], { breakFn: ({ isCircular }) => isCircular }),
    result: [['a']]
  },
  objectScan: {
    fn: (v) => objectScan(['**'], { breakFn: ({ isCircular }) => isCircular })(v),
    result: [['a']]
  }
};
