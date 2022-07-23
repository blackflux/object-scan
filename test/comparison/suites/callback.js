import { JSONPath } from 'jsonpath-plus';
import objectScan from '../../../src/index.js';

const objScanResult = [{
  key: ['F', 'G', 'I', 'H'],
  value: 3,
  parent: { H: 3 },
  property: 'H'
}, {
  key: ['F', 'G', 'I'],
  value: { H: 3 },
  parent: { I: { H: 3 } },
  property: 'I'
}, {
  key: ['F', 'G'],
  value: { I: { H: 3 } },
  parent: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } },
  property: 'G'
}, {
  key: ['F', 'B', 'D', 'E'],
  value: 2,
  parent: { C: 1, E: 2 },
  property: 'E'
}, {
  key: ['F', 'B', 'D', 'C'],
  value: 1,
  parent: { C: 1, E: 2 },
  property: 'C'
}, {
  key: ['F', 'B', 'D'],
  value: { C: 1, E: 2 },
  parent: { A: 0, D: { C: 1, E: 2 } },
  property: 'D'
}, {
  key: ['F', 'B', 'A'],
  value: 0,
  parent: { A: 0, D: { C: 1, E: 2 } },
  property: 'A'
}, {
  key: ['F', 'B'],
  value: { A: 0, D: { C: 1, E: 2 } },
  parent: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } },
  property: 'B'
}, {
  key: ['F'],
  value: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } },
  parent: { F: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } } },
  property: 'F'
}];

const objectScanComment = '[Documentation](#callbacks)';

export default {
  _name: 'Callback with Context',
  _fixture: 'tree',
  objectScanCompiled: {
    comment: objectScanComment,
    fn: objectScan(['**'], {
      beforeFn: (state) => {
        // eslint-disable-next-line no-param-reassign
        state.context = [];
      },
      filterFn: ({
        context, key, value, parent, property
      }) => {
        context.push({
          key, value, parent, property
        });
      },
      rtn: 'context'
    }),
    result: objScanResult
  },
  objectScan: {
    comment: objectScanComment,
    fn: (v) => objectScan(['**'], {
      filterFn: ({
        context, key, value, parent, property
      }) => {
        context.push({
          key, value, parent, property
        });
      }
    })(v, []),
    result: objScanResult
  },
  jsonpathplus: {
    comment: 'Usefulness limited since context is lacking information',
    fn: (v) => {
      const result = [];
      JSONPath({
        path: '$..*',
        json: v,
        callback: (value, resultType, context) => {
          result.push(context);
        }
      });
      return result;
    },
    result: [{
      path: "$['F']",
      value: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } },
      parent: { F: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } } },
      parentProperty: 'F',
      hasArrExpr: true
    }, {
      path: "$['F']['B']",
      value: { A: 0, D: { C: 1, E: 2 } },
      parent: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } },
      parentProperty: 'B',
      hasArrExpr: true
    }, {
      path: "$['F']['G']",
      value: { I: { H: 3 } },
      parent: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } },
      parentProperty: 'G',
      hasArrExpr: true
    }, {
      path: "$['F']['B']['A']",
      value: 0,
      parent: { A: 0, D: { C: 1, E: 2 } },
      parentProperty: 'A',
      hasArrExpr: true
    }, {
      path: "$['F']['B']['D']",
      value: { C: 1, E: 2 },
      parent: { A: 0, D: { C: 1, E: 2 } },
      parentProperty: 'D',
      hasArrExpr: true
    }, {
      path: "$['F']['B']['D']['C']",
      value: 1,
      parent: { C: 1, E: 2 },
      parentProperty: 'C',
      hasArrExpr: true
    }, {
      path: "$['F']['B']['D']['E']",
      value: 2,
      parent: { C: 1, E: 2 },
      parentProperty: 'E',
      hasArrExpr: true
    }, {
      path: "$['F']['G']['I']",
      value: { H: 3 },
      parent: { I: { H: 3 } },
      parentProperty: 'I',
      hasArrExpr: true
    }, {
      path: "$['F']['G']['I']['H']",
      value: 3,
      parent: { H: 3 },
      parentProperty: 'H',
      hasArrExpr: true
    }]
  }
};
