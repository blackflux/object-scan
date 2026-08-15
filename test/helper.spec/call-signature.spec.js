import { describe } from 'node-tdd';
import { expect } from 'chai';
import objectScan from '../../src/index.js';
import callSignature, { measureTiming, median } from '../helper/call-signature.js';
import resultFixture from './call-signature.spec.js__fixtures/result.js';

describe('Testing call-signature.js', () => {
  it('Testing basic', () => {
    const haystack = { parent: { children: [{ property: 'A' }, { property: 'B' }] } };
    const needles = ['**'];
    const result = callSignature({ objectScan, haystack, needles });
    expect(result).to.deep.equal(resultFixture);
  });

  it('Testing median', () => {
    expect(median([3, 1, 2])).to.equal(2);
    expect(median([4, 1, 3, 2])).to.equal(2.5);
  });

  it('Testing measureTiming', () => {
    const haystack = { parent: { children: [{ property: 'A' }, { property: 'B' }] } };
    const needles = ['**'];
    const kwargs = { useArraySelector: true, reverse: true, orderByNeedles: false };
    const originalGc = global.gc;
    global.gc = () => {};
    try {
      const result = measureTiming({
        objectScan, haystack, needles, kwargs
      });
      expect(result).to.have.keys(['compile', 'traverse']);
      expect(result.compile).to.be.a('number');
      expect(result.traverse).to.be.a('number');
    } finally {
      global.gc = originalGc;
    }
  });
});
