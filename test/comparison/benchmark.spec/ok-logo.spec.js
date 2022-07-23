import { describe } from 'node-tdd';
import { expect } from 'chai';
import okLogo from '../benchmark/ok-logo.js';

describe('Testing ok-logo.js', () => {
  it('Testing basic', () => {
    expect(okLogo.startsWith('data:image/png;base64,')).to.equal(true);
  });
});
