const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('../../src/index');
const callSignature = require('../helper/call-signature');

describe('Testing call-signature.js', () => {
  it('Testing basic', ({ fixture }) => {
    const haystack = { parent: { children: [{ property: 'A' }, { property: 'B' }] } };
    const needles = ['**'];
    const result = callSignature({ objectScan, haystack, needles });
    expect(result.duration).to.have.keys(['compile', 'traverse']);
    expect(result.duration.compile).to.be.a('number');
    expect(result.duration.traverse).to.be.a('number');
    expect(result).to.deep.equal({ duration: result.duration, ...fixture('result') });
  });
});
