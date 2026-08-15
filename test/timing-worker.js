/* Dedicated timing worker.
 *
 * Measures local vs released object-scan in a SINGLE process, interleaved, so
 * both implementations share the same JIT/GC environment. Comparing across two
 * separate processes is dominated by independent JIT warm-up and GC state, which
 * swamps the small real differences. Running both in one process with warm-up,
 * batch timing and median sampling gives a reliable relative measurement.
 */
import objectScanReleased from 'object-scan';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

import { measureTiming } from './helper/call-signature.js';
import generateDataset from './helper/generate-dataset.js';
import generateNeedles from './helper/generate-needles.js';

const localEntry = existsSync(join(fileURLToPath(new URL('.', import.meta.url)), '..', 'lib', 'index.js'))
  ? join(fileURLToPath(new URL('.', import.meta.url)), '..', 'lib', 'index.js')
  : join(fileURLToPath(new URL('.', import.meta.url)), '..', 'src', 'index.js');
const objectScanLocal = (await import(localEntry)).default;

// Warm up both implementations' JIT before serving any timing requests so the
// first measurement is not polluted by cold-start optimization.
const warmup = () => {
  for (let i = 0; i < 20; i += 1) {
    const { rng, haystack, paths } = generateDataset();
    const needles = generateNeedles({
      rng,
      paths,
      useArraySelector: true,
      reverse: true,
      orderByNeedles: false,
      pathModifierParams: () => ({}),
      groupModifierParams: () => ({}),
      needleArrayProbability: 0
    });
    const kwargs = { useArraySelector: true, reverse: true, orderByNeedles: false };
    objectScanLocal(needles, { ...kwargs, strict: false })(haystack);
    objectScanReleased(needles, { ...kwargs, strict: false })(haystack);
  }
};
warmup();

process.send('ready');

process.on('message', (msg) => {
  if (msg === 'exit') {
    process.exit(0);
    return;
  }
  const { datasets } = msg;
  try {
    // Measure a BATCH of datasets (not a single one) so each timing sample is a
    // stable aggregate across many workloads. Single-dataset sampling is
    // dominated by the huge variance between datasets (10x+ spread), which made
    // the reported compile/traverse percentages flip sign between runs.
    //
    // For each dataset, local and released are measured in an interleaved
    // A/B/A/B pattern and the per-dataset ratio (local/released) is computed.
    // Interleaving cancels slow drift (CPU freq, thermal, GC state); aggregating
    // the ratios across the batch cancels dataset variance. The median ratio is
    // reported.
    const compileRatios = [];
    const traverseRatios = [];
    datasets.forEach(({ haystack, needles, kwargs }) => {
      try {
        const l1 = measureTiming({
          objectScan: objectScanLocal, haystack, needles, kwargs
        });
        const r1 = measureTiming({
          objectScan: objectScanReleased, haystack, needles, kwargs
        });
        const r2 = measureTiming({
          objectScan: objectScanReleased, haystack, needles, kwargs
        });
        const l2 = measureTiming({
          objectScan: objectScanLocal, haystack, needles, kwargs
        });
        const lCompile = (l1.compile + l2.compile) / 2;
        const rCompile = (r1.compile + r2.compile) / 2;
        const lTraverse = (l1.traverse + l2.traverse) / 2;
        const rTraverse = (r1.traverse + r2.traverse) / 2;
        compileRatios.push(lCompile / rCompile);
        traverseRatios.push(lTraverse / rTraverse);
      } catch {
        // A dataset may be rejected by both implementations (e.g. an invalid
        // regex needle). Skip it rather than failing the whole timing batch.
      }
    });
    const median = (arr) => {
      const s = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(s.length / 2);
      return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
    };
    process.send({
      compile: median(compileRatios),
      traverse: median(traverseRatios)
    });
  } catch (err) {
    process.send({ error: err.message });
  }
});

process.on('exit', () => {
  process.exit(0);
});
