import { expect } from 'chai';
import { describe } from 'node-tdd';
import { escape, asRegex } from '../../src/generic/helper.js';

describe('Testing Helper', () => {
  describe('Testing escape', () => {
    it('Testing basic escaping', () => {
      expect(escape('a[]')).to.equal('a\\[\\]');
    });
  });

  describe('Testing asRegex', () => {
    it('Testing simple regex', () => {
      const result = asRegex('a');
      expect(result).to.deep.equal(/a/);
      expect(result.test('xax')).to.equal(true);
    });

    it('Testing invalid regex', () => {
      expect(() => asRegex('(')).to.throw('Invalid Regex: "("');
    });
  });
});
