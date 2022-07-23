import { describe } from 'node-tdd';
import { expect } from 'chai';
import getColorForValue from '../benchmark/get-color-for-value.js';

describe('Testing get-color-for-value.js', () => {
  it('Testing basic', () => {
    const result = [];
    for (let i = -3; i < 25; i += 1) {
      result.push(getColorForValue(i));
    }
    expect(result).to.deep.equal([
      '#1f811f', '#1f811f', '#1f811f', '#1f811f',
      '#1f811f', '#4e8e1d', '#7e9b1b', '#ada819',
      '#dcb517', '#dba615', '#db9714', '#da8812',
      '#da7911', '#d96a0f', '#d56110', '#d15910',
      '#cd5011', '#c94811', '#c53f12', '#c03612',
      '#bc2e13', '#b82513', '#b41d14', '#b01414',
      '#b01414', '#b01414', '#b01414', '#b01414'
    ]);
  });
});
