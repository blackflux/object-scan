import { describe } from 'node-tdd';
import { expect } from 'chai';
import runBenchmark from '../benchmark/run-benchmark.js';

describe('Testing run-benchmark.js', () => {
  it('Testing basic', () => {
    const r = runBenchmark(() => {}, {});
    expect(typeof r).to.equal('number');
  });
});
