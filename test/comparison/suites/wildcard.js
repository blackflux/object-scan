import objectScan from '../../../src/index.js';

export default {
  _name: 'Wildcard',
  _fixture: 'foo',
  objectScanCompiled: {
    fn: objectScan(['entries.fo+b?r']),
    result: [['entries', 'fooooobar'], ['entries', 'foobar']]
  },
  objectScan: {
    fn: (v) => objectScan(['entries.fo+b?r'])(v),
    result: [['entries', 'fooooobar'], ['entries', 'foobar']]
  }
};
