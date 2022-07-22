import objectScan from '../../../src/index.js';

export default {
  _name: 'Exclusion',
  _fixture: 'tree',
  _result: [
    ['F', 'G', 'I', 'H']
  ],
  objectScanCompiled: objectScan(['**.{C,E,H}', '!*.*.D.**']),
  objectScan: (v) => objectScan(['**.{C,E,H}', '!*.*.D.**'])(v)
};
