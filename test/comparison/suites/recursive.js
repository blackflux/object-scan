import jsonpath from 'jsonpath';
import objectScan from '../../../src/index.js';

export default {
  _index: 3,
  _name: 'Recursive Traversal',
  _fixture: 'tree',
  objectScanCompiled: {
    fn: objectScan(['**'], {
      reverse: false,
      joined: true
    }),
    result: [
      'F.B.A',
      'F.B.D.C',
      'F.B.D.E',
      'F.B.D',
      'F.B',
      'F.G.I.H',
      'F.G.I',
      'F.G',
      'F'
    ]
  },
  objectScan: {
    fn: (v) => objectScan(['**'], {
      reverse: false,
      joined: true
    })(v),
    result: [
      'F.B.A',
      'F.B.D.C',
      'F.B.D.E',
      'F.B.D',
      'F.B',
      'F.G.I.H',
      'F.G.I',
      'F.G',
      'F'
    ]
  },
  jsonpath: {
    fn: (v) => jsonpath.paths(v, '$..[*]').map((e) => jsonpath.stringify(e).slice(2)),
    result: [
      'F',
      'F.B',
      'F.G',
      'F.B.A',
      'F.B.D',
      'F.B.D.C',
      'F.B.D.E',
      'F.G.I',
      'F.G.I.H'
    ]
  }
};
