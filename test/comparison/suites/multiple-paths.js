import Nimma from 'nimma';
import objectScan from '../../../src/index.js';

const jsonpathComment = (
  '[Reference](https://stackoverflow.com/questions/55497833/jsonpath-union-of-multiple-different-paths)'
);

const nimmaComment = 'Path deduplication has to be done in post processing';

export default {
  _name: 'Multiple Paths',
  _fixture: 'tree',
  _result: [[['F.*.I', '*.G.I'], 'I'], [['*.*.A'], 'A']],
  objectScanCompiled: objectScan(['F.*.I', '*.G.I', '*.*.A'], { rtn: ['matchedBy', 'property'] }),
  objectScan: (v) => objectScan(['F.*.I', '*.G.I', '*.*.A'], { rtn: ['matchedBy', 'property'] })(v),
  jsonpath: {
    comment: jsonpathComment
  },
  jsonpathplus: {
    comment: jsonpathComment
  },
  nimma: {
    comment: nimmaComment,
    fn: (v) => {
      const result = [];
      const fn = ({ path }) => {
        result.push(path.slice(0));
      };
      new Nimma(['$.F.*.I', '$.*.G.I', '$.*.*.A']).query(v, {
        '$.F.*.I': fn,
        '$.*.G.I': fn,
        '$.*.*.A': fn
      });
      return result;
    },
    result: [['F', 'B', 'A'], ['F', 'G', 'I'], ['F', 'G', 'I']]
  },
  nimmaCompiled: {
    comment: nimmaComment,
    fn: (() => {
      const n = new Nimma(['$.F.*.I', '$.*.G.I', '$.*.*.A']);
      return (v) => {
        const result = [];
        const fn = ({ path }) => {
          result.push(path.slice(0));
        };
        n.query(v, {
          '$.F.*.I': fn,
          '$.*.G.I': fn,
          '$.*.*.A': fn
        });
        return result;
      };
    })(),
    result: [['F', 'B', 'A'], ['F', 'G', 'I'], ['F', 'G', 'I']]
  }
};
