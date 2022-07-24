import { expect } from 'chai';
import Nimma from 'nimma';
import objectScan from '../../src/index.js';
import { AccessLogger } from './access-counts/access-logger.js';
import fixture from './access-counts/fixture.js';

const needlesToNimma = (needles) => needles.map(
  (n) => `$.${n}`
    .replace(/\.\*\*\./g, '..')
);

describe('Testing access counts', () => {
  it('Testing objectScan', () => {
    const al = new AccessLogger(fixture.obj);
    const result = objectScan(fixture.needles, {
      joined: true,
      filterFn: ({
        matchedBy, key, value, context
      }) => {
        matchedBy.forEach((m) => {
          context.push([key, m, value]);
        });
      }
    })(al.obj, []);
    expect(al.reset()).to.deep.equal([
      'a', 'b', 'e', 'e', 'd', 'd', 'c', 'c', 'b', 'a'
    ]);
    expect(result).to.deep.equal(fixture.expected);
  });

  it('Testing nimma', () => {
    const al = new AccessLogger(fixture.obj);
    const needles = needlesToNimma(fixture.needles);

    const result = [];
    new Nimma(needles).query(al.obj, needles.reduce((p, k) => ({
      ...p,
      [k]({ value, path }) {
        result.push([path.join('.'), k, value]);
      }
    }), {}));
    expect(al.reset()).to.deep.equal([
      'a', 'b', 'a', 'b', 'c', 'a', 'b', 'a', 'b', 'd',
      'a', 'b', 'a', 'b', 'e', 'a', 'a', 'b', 'a', 'a',
      'b', 'b', 'c', 'c', 'd', 'd', 'e', 'e'
    ]);
    const expected = fixture.expected
      .map(([path, needle, value]) => [path, needlesToNimma([needle])[0], value])
      .sort();
    expect(result.sort()).to.deep.equal(expected);
  });
});
