import { describe } from 'node-tdd';
import { expect } from 'chai';
import runBenchmark from '../benchmark/run-benchmark.js';

describe('Testing run-benchmark.js', () => {
  it('Testing basic', async () => {
    const r = await runBenchmark('value', 'objectScan', {});
    expect(typeof r).to.equal('number');
  });
});
