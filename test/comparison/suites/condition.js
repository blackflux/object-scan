import jsonpath from 'jsonpath';
import jmespath from 'jmespath';
import { JSONPath } from 'jsonpath-plus';
import Nimma from 'nimma';
import objectScan from '../../../src/index.js';

const commentObjectScan = 'Only in code logic';

export default {
  _name: 'Conditional Path',
  _fixture: 'cond',
  objectScanCompiled: {
    comment: commentObjectScan,
    fn: objectScan(['*[*].y'], {
      breakFn: ({ depth, value }) => depth === 2 && value?.x !== 'yes'
    }),
    result: [['a', 0, 'y']]
  },
  objectScan: {
    comment: commentObjectScan,
    fn: (v) => objectScan(['*[*].y'], {
      breakFn: ({ depth, value }) => depth === 2 && value?.x !== 'yes'
    })(v),
    result: [['a', 0, 'y']]
  },
  jsonpath: {
    fn: (v) => jsonpath.paths(v, "$.*[?(@.x == 'yes')].y"),
    result: [['$', 'a', 0, 'y']]
  },
  jsonpathplus: {
    fn: (v) => JSONPath({ path: "$.*[?(@.x == 'yes')].y", json: v, resultType: 'path' }),
    result: ["$['a'][0]['y']"]
  },
  jmespath: {
    fn: (v) => jmespath.search(v, "*[?(x == 'yes')].y"),
    result: [[2], []]
  },
  nimma: {
    fn: (v) => {
      const result = [];
      new Nimma(["$.*[?(@.x == 'yes')].y"]).query(v, {
        "$.*[?(@.x == 'yes')].y": ({ path }) => {
          result.push(path.slice(0));
        }
      });
      return result;
    },
    result: [['a', 0, 'y']]
  },
  nimmaCompiled: {
    fn: (() => {
      const n = new Nimma(["$.*[?(@.x == 'yes')].y"]);
      return (v) => {
        const result = [];
        n.query(v, {
          "$.*[?(@.x == 'yes')].y": ({ path }) => {
            result.push(path.slice(0));
          }
        });
        return result;
      };
    })(),
    result: [['a', 0, 'y']]
  }
};
