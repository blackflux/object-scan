import { expect } from 'chai';
import { describe } from 'node-tdd';
import { parseValue } from '../../src/core/node.js';

describe('Testing Helper', () => {
  describe('Testing parseValue', () => {
    it('Testing empty', () => {
      expect(parseValue('')).to.have.all.keys('test');
    });

    it('Testing star', () => {
      expect(parseValue('*')).to.deep.equal(/^.*$/);
    });

    it('Testing question mark', () => {
      expect(parseValue('?')).to.deep.equal(/^.$/);
    });

    it('Testing escaped star', () => {
      const result = parseValue('pa\\*nt\\*');
      expect(result).to.deep.equal(/^pa\*nt\*$/);
      expect(result.test('pa*nt*')).to.equal(true);
    });

    it('Testing special=false, regex=true', () => {
      const result = parseValue('pa^');
      expect(result).to.deep.equal(/^pa\^$/);
      expect(result.test('pa^')).to.equal(true);
    });

    it('Testing special=true, regex=true', () => {
      const result = parseValue('pa\\[');
      expect(result).to.deep.equal(/^pa\[$/);
      expect(result.test('pa[')).to.equal(true);
    });

    it('Testing special=true, regex=false', () => {
      const result = parseValue('pa\\!');
      expect(result).to.have.all.keys('test');
      expect(result.test('pa!')).to.equal(true);
    });
  });
});
