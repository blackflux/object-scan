import { expect } from 'chai';
import { describe } from 'node-tdd';
import { parseWildcard } from '../../src/core/wildcard';

describe('Testing Helper', () => {
  describe('Testing parseWildcard', () => {
    it('Testing empty', () => {
      expect(parseWildcard('')).to.deep.equal(/^$/);
    });

    it('Testing star', () => {
      expect(parseWildcard('*')).to.deep.equal(/^.*$/);
    });

    it('Testing question mark', () => {
      expect(parseWildcard('?')).to.deep.equal(/^.$/);
    });

    it('Testing escaped star', () => {
      const result = parseWildcard('pa\\*nt\\*');
      expect(result).to.deep.equal(/^pa\*nt\*$/);
      expect(result.test('pa*nt*')).to.equal(true);
    });

    it('Testing special=false, regex=true', () => {
      const result = parseWildcard('pa^');
      expect(result).to.deep.equal(/^pa\^$/);
      expect(result.test('pa^')).to.equal(true);
    });

    it('Testing special=true, regex=true', () => {
      const result = parseWildcard('pa\\[');
      expect(result).to.deep.equal(/^pa\[$/);
      expect(result.test('pa[')).to.equal(true);
    });

    it('Testing special=true, regex=false', () => {
      const result = parseWildcard('pa\\!');
      expect(result).to.deep.equal(/^pa!$/);
      expect(result.test('pa!')).to.equal(true);
    });
  });
});
