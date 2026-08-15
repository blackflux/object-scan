import { fork } from 'child_process';

import { join } from 'path';
import fs from 'smart-fs';
import isEqual from 'lodash.isequal';

import generateDataset from './helper/generate-dataset.js';
import generateNeedles from './helper/generate-needles.js';
import createHtmlDiff from './helper/create-html-diff.js';

const TEST_COUNT = Number(process.env.TEST_COUNT || 10000000);
// How often (in iterations) to run a proper timing measurement. Correctness is
// checked every iteration; timing is expensive (warm-up + batch sampling) so it
// is sampled periodically.
const TIMING_INTERVAL = Number(process.env.TIMING_INTERVAL || 1000);
// Number of datasets aggregated into each timing sample. Timing is measured
// over a batch of datasets (not a single one) so each sample is a stable
// aggregate across many workloads; single-dataset sampling is dominated by the
// huge variance between datasets, which made the reported compile/traverse
// percentages flip sign between runs.
const TIMING_BATCH = Number(process.env.TIMING_BATCH || 10);

// eslint-disable-next-line no-console
const log = (...args) => console.log(...args);

const Worker = async (workerFile = 'worker.js', execArgv = []) => {
  const compute = fork(join(fs.dirname(import.meta.url), workerFile), { execArgv });
  await new Promise((resolve) => {
    // waiting for worker to be ready
    compute.on('message', () => resolve());
  });
  let resolve;
  let reject;
  compute.on('message', (result) => resolve(result));
  compute.on('exit', () => {
    if (reject) {
      reject(new Error('Worker exited unexpectedly'));
    }
  });
  return {
    exec: async (kwargs) => {
      const result = new Promise((r, j) => {
        resolve = r;
        reject = j;
      });
      compute.send(kwargs);
      return result;
    },
    exit: () => {
      compute.send('exit');
    }
  };
};

// Rolling window of recent timing samples. Reporting the median of recent
// samples (rather than a cumulative average) prevents early warm-up-polluted
// measurements from dominating the reported percentage. The window is sized to
// smooth the residual per-sample variance that remains after batch aggregation.
const WINDOW = 20;

// Tracks the local/released timing ratio samples produced by the timing worker
// (one sample per timing flush). Each sample is already a stable aggregate over
// a batch of datasets, so the rolling-window median and cumulative average of
// these samples give a reliable trend.
const Time = () => {
  const data = {
    compile: { window: [], sum: 0, count: 0 },
    traverse: { window: [], sum: 0, count: 0 }
  };
  const median = (arr) => {
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };
  return {
    add: (ratios) => {
      Object.keys(data).forEach((k) => {
        data[k].window.push(ratios[k]);
        if (data[k].window.length > WINDOW) {
          data[k].window.shift();
        }
        data[k].sum += ratios[k];
        data[k].count += 1;
      });
    },
    get: (k) => median(data[k].window),
    getAvg: (k) => data[k].sum / data[k].count
  };
};

const execute = async () => {
  const time = Time();

  const worker1 = await Worker();
  const worker2 = await Worker();
  // Dedicated timing worker measures both implementations in a single process
  // (interleaved) so they share the same JIT/GC environment. This is far more
  // reliable than comparing two separate processes. --expose-gc lets the timing
  // worker force GC between samples to avoid GC pauses polluting the timing.
  const timingWorker = await Worker('timing-worker.js', ['--expose-gc']);
  // Buffer of datasets accumulated since the last timing flush. Flushed to the
  // timing worker every TIMING_INTERVAL iterations so each timing sample is an
  // aggregate over many workloads (see timing-worker.js).
  let timingBuffer = [];

  for (let count = 1; count <= TEST_COUNT; count += 1) {
    const { rng, haystack, paths } = generateDataset();
    const useArraySelector = rng() > 0.2;
    const reverse = rng() > 0.5;
    const orderByNeedles = rng() > 0.9;
    const needles = generateNeedles({
      rng,
      paths,
      useArraySelector,
      reverse,
      orderByNeedles,
      pathModifierParams: (p) => ({
        lenPercentage: rng() > 0.1 ? rng() : 1,
        questionMark: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        partialPlus: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        partialStar: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        singleStar: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        doublePlus: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        doubleStar: rng() > 0.15 ? 0 : Math.floor(rng() * p.length) + 1,
        regex: rng() > 0.1 ? 0 : Math.floor(rng() * p.length) + 1,
        exclude: rng() > 0.9,
        shuffle: rng() > 0.9
      }),
      groupModifierParams: () => ({
        anyRecGroup: rng() > 0.2 ? 0 : rng(),
        doublePlusGroup: rng() > 0.2 ? 0 : rng(),
        doubleStarGroup: rng() > 0.2 ? 0 : rng()
      }),
      needleArrayProbability: rng() > 0.2 ? 0 : rng()
    });

    const kwargs = {
      haystack,
      needles,
      useArraySelector,
      reverse,
      orderByNeedles
    };
    // Collect a sample of datasets for the periodic timing measurement. Timing
    // is measured over a BATCH of datasets (flushed every TIMING_INTERVAL
    // iterations) so each timing sample is a stable aggregate across many
    // workloads, rather than a single random dataset whose huge variance made
    // the reported compile/traverse percentages flip sign between runs. Only
    // the actual scan options are forwarded (not haystack/needles, which are
    // not valid object-scan options).
    if ((count % Math.ceil(TIMING_INTERVAL / TIMING_BATCH)) === 0) {
      timingBuffer.push({
        haystack,
        needles,
        kwargs: { useArraySelector, reverse, orderByNeedles }
      });
    }
    // eslint-disable-next-line no-await-in-loop
    const [signatureLocal, signatureReleased] = await Promise.all([
      worker1.exec({ ...kwargs, useLocal: true }),
      worker2.exec({ ...kwargs, useLocal: false })
    ]);
    // A worker may report an error (e.g. an invalid regex needle that both
    // implementations reject). If both implementations throw the same error,
    // there is no mismatch — treat it as a pass and skip the comparison.
    if (signatureLocal.error || signatureReleased.error) {
      if (signatureLocal.error !== signatureReleased.error) {
        log([
          `Mismatch for seed: ${rng.seed}`,
          `(local error: ${signatureLocal.error},`,
          `released error: ${signatureReleased.error})`
        ].join(' '));
      }
      // eslint-disable-next-line no-continue
      continue;
    }

    if (!isEqual(signatureReleased, signatureLocal)) {
      log(`Mismatch for seed: ${rng.seed}`);
      const diff = createHtmlDiff(rng.seed, signatureReleased, signatureLocal, {
        kwargs,
        seed: rng.seed
      });
      fs.smartWrite(
        join(fs.dirname(import.meta.url), '..', 'debug', `${rng.seed}.html`),
        diff.split('\n')
      );
    }

    // Periodically measure timing with a proper methodology (warm-up + batch
    // sampling + median) in a single shared process, instead of single-shot
    // timing across two separate processes, which is dominated by JIT warm-up
    // and GC noise.
    if ((count % TIMING_INTERVAL) === 0) {
      // eslint-disable-next-line no-await-in-loop
      const timing = await timingWorker.exec({ datasets: timingBuffer });
      timingBuffer = [];
      // The timing worker may report an error if every dataset in the batch was
      // rejected; skip the sample in that case rather than crashing.
      if (timing.error) {
        log(`Timing error: ${timing.error}`);
        // eslint-disable-next-line no-continue
        continue;
      }
      // The timing worker returns the median local/released ratio per metric
      // (aggregated over the batch of datasets). ratio < 1 means local is
      // faster, so a positive percentage means local is faster.
      time.add(timing);
      const parts = ['compile', 'traverse'].map((k) => {
        const ratio = time.get(k);
        const percent = (1 - ratio) * 100.0;
        const avgRatio = time.getAvg(k);
        const avgPercent = (1 - avgRatio) * 100.0;
        const fmt = (p) => `${p > 0 ? '+' : ''}${p.toFixed(2)}%`;
        return `${k}: ${fmt(percent)} avg ${fmt(avgPercent)}`;
      });
      log(`Progress: ${count} / ${TEST_COUNT} (${parts.join(', ')})`);
    }
  }
  worker1.exit();
  worker2.exit();
  timingWorker.exit();
};
execute();
