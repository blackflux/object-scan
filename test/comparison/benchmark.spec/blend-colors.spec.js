import { describe } from 'node-tdd';
import { expect } from 'chai';
import blendColors from '../benchmark/blend-colors.js';

describe('Testing blend-colors.js', () => {
  it('Testing basic', () => {
    expect(blendColors('#ff0000', '#000000', 0.5))
      .to.equal('#800000');
  });
});
