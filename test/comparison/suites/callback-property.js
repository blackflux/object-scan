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
            property: parentProperty
          });
        }
      });
      return result;
    },
    result: [
      { property: 'F' },
      { property: 'B' },
      { property: 'G' },
      { property: 'A' },
      { property: 'D' },
      { property: 'C' },
      { property: 'E' },
      { property: 'I' },
      { property: 'H' }
    ]
  }
};
