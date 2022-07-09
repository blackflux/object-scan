import jsonpath from 'jsonpath';
import jmespath from 'jmespath';
import objectScan from '../../../src/index.js';

export default {
  fixture: 'cond',
  objectScanCompiled: [
    objectScan(['*[*].y'], {
      breakFn: ({ depth, value }) => depth === 2 && value?.x !== 'yes',
      joined: true
    }),
    ['a[0].y']
  ],
  objectScan: [
    (v) => objectScan(['*[*].y'], {
      breakFn: ({ depth, value }) => depth === 2 && value?.x !== 'yes',
      joined: true
    })(v),
    ['a[0].y']
  ],
  jsonpath: [
    (v) => jsonpath.paths(v, "$.*[?(@.x == 'yes')].y").map((e) => jsonpath.stringify(e).slice(2)),
    ['a[0].y']
  ],
  jmespath: [
    (v) => jmespath.search(v, "*[?(x == 'yes')].y"),
    [[2], []]
  ]
};
