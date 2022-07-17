import { JSONPath } from 'jsonpath-plus';
import objectScan from '../../../src/index.js';

const objScanResult = [
  { property: 'H' },
  { property: 'I' },
  { property: 'G' },
  { property: 'E' },
  { property: 'C' },
  { property: 'D' },
  { property: 'A' },
  { property: 'B' },
  { property: 'F' }
];

export default {
  _index: 4,
  _name: 'Callback: Property',
  _fixture: 'tree',
  objectScanCompiled: {
    fn: objectScan(['**'], {
      beforeFn: (state) => {
        // eslint-disable-next-line no-param-reassign
        state.context = [];
      },
      filterFn: ({ context, property }) => {
        context.push({ property });
      },
      rtn: 'context'
    }),
    result: objScanResult
  },
  objectScan: {
    fn: (v) => objectScan(['**'], {
      filterFn: ({ context, property }) => {
        context.push({ property });
      }
    })(v, []),
    result: objScanResult
  },
  jsonpathplus: {
    fn: (v) => {
      const result = [];
      JSONPath({
        path: '$..[*]',
        json: v,
        callback: (value, resultType, { parentProperty }) => {
          result.push({
            parent: parentProperty
          });
        }
      });
      return result;
    },
    result: [
      { parent: 'F' },
      { parent: 'B' },
      { parent: 'G' },
      { parent: 'A' },
      { parent: 'D' },
      { parent: 'C' },
      { parent: 'E' },
      { parent: 'I' },
      { parent: 'H' }
    ]
  }
};
