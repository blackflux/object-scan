import jsonpath from 'jsonpath';
import objectScan from '../../../src/index.js';

export default {
  fixture: 'tree',
  objectScanCompiled: [
    objectScan(['**'], {
      reverse: false,
      joined: true
    }),
    [
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
  ],
  objectScan: [
    (v) => objectScan(['**'], {
      reverse: false,
      joined: true
    })(v),
    [
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
  ],
  jsonpath: [
    (v) => jsonpath.paths(v, '$..[*]').map((e) => jsonpath.stringify(e).slice(2)),
    [
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
  ]
};
