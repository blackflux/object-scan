import { describe } from 'node-tdd';
import { expect } from 'chai';
import objectScan from '../../src/index';
import callSignature from '../helper/call-signature';

describe('Testing call-signature.js', () => {
  it('Testing basic', ({ fixture }) => {
    const haystack = { parent: { children: [{ property: 'A' }, { property: 'B' }] } };
    const needles = ['**'];
    const result = callSignature({ objectScan, haystack, needles });
    expect(result.duration).to.have.keys(['compile', 'traverse']);
    expect(result.duration.compile).to.be.a('number');
    expect(result.duration.traverse).to.be.a('number');
    expect(result).to.deep.equal({ duration: result.duration, ...fixture('result').default });
  });
});
