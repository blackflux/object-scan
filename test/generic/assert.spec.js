import { expect } from 'chai';
import assert from '../../src/generic/assert.js';

describe('Testing assert.js', () => {
  it('Testing throw', () => {
    expect(() => assert(false, 'message')).to.throw('message');
  });

  it('Testing throw Logic Error', () => {
    expect(() => assert(false)).to.throw('Internal Logic Error');
  });
});
