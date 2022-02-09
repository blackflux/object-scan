import { describe } from 'node-tdd';
import { expect } from 'chai';
import objectScan from '../../src/index.js';
import callSignature from '../helper/call-signature.js';
import resultFixture from './call-signature.spec.js__fixtures/result.js';

describe('Testing call-signature.js', () => {
  it('Testing basic', () => {
    const haystack = { parent: { children: [{ property: 'A' }, { property: 'B' }] } };
    const needles = ['**'];
    const result = callSignature({ objectScan, haystack, needles });
    expect(result.duration).to.have.keys(['compile', 'traverse']);
    expect(result.duration.compile).to.be.a('number');
    expect(result.duration.traverse).to.be.a('number');
    expect(result).to.deep.equal({ duration: result.duration, ...resultFixture });
  });
});
