import objectScan from '../../../src/index.js';

export default {
  _name: 'Path Recursion',
  _fixture: 'nested',
  _result: [
    ['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b'],
    ['a', 'b', 'a', 'b', 'a', 'b'],
    ['a', 'b', 'a', 'b'],
    ['a', 'b']
  ],
  objectScanCompiled: objectScan(['**{a.b}']),
  objectScan: (v) => objectScan(['**{a.b}'])(v)
};
