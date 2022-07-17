import jsonpath from 'jsonpath';
import jmespath from 'jmespath';
import objectScan from '../../../src/index.js';

export default {
  _index: 2,
  _name: 'Conditional Path',
  _fixture: 'cond',
  objectScanCompiled: {
    fn: objectScan(['*[*].y'], {
      breakFn: ({ depth, value }) => depth === 2 && value?.x !== 'yes',
      joined: true
    }),
    result: ['a[0].y']
  },
  objectScan: {
    fn: (v) => objectScan(['*[*].y'], {
      breakFn: ({ depth, value }) => depth === 2 && value?.x !== 'yes',
      joined: true
    })(v),
    result: ['a[0].y']
  },
  jsonpath: {
    fn: (v) => jsonpath.paths(v, "$.*[?(@.x == 'yes')].y").map((e) => jsonpath.stringify(e).slice(2)),
    result: ['a[0].y']
  },
  jmespath: {
    fn: (v) => jmespath.search(v, "*[?(x == 'yes')].y"),
    result: [[2], []]
  }
};
