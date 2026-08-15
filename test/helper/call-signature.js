/* Timing constants for reliable microbenchmarking.
 *
 * The operations being measured (compile and traverse) run in the microsecond
 * range, so single-shot hrtime timing is dominated by JIT warm-up, GC pauses
 * and CPU frequency drift. To get a stable measurement we:
 *   - warm up the operation so V8 reaches steady-state optimization,
 *   - time a batch of operations and divide (amortizes per-op overhead),
 *   - repeat over several samples and take the median (robust to outliers).
 *
 * The batch is time-based (run until MIN_BATCH_MS has elapsed) so it adapts to
 * the operation speed and always measures a meaningful duration.
 */
const WARMUP = 200; // throwaway iterations before timing
const MIN_BATCH_MS = 20; // minimum wall-clock duration of a timed batch
const SAMPLES = 5; // timed batches; median is reported

export const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

// Run `fn` in a loop until MIN_BATCH_MS has elapsed; return avg ms/op.
const timeBatch = (fn) => {
  const target = MIN_BATCH_MS * 1e6; // ns
  let count = 0;
  const start = process.hrtime.bigint();
  let elapsed = 0n;
  do {
    fn();
    count += 1;
    elapsed = process.hrtime.bigint() - start;
  } while (elapsed < target);
  return Number(elapsed) / 1e6 / count;
};

const batchCompile = (objectScan, needles, kwargs) => timeBatch(
  () => objectScan(needles, { ...kwargs, strict: false })
);

const batchTraverse = (objectScan, haystack, needles, kwargs) => {
  const scanner = objectScan(needles, { ...kwargs, strict: false });
  return timeBatch(() => scanner(haystack));
};

export const measureTiming = ({
  objectScan, haystack, needles, kwargs
}) => {
  // warm up both paths
  for (let i = 0; i < WARMUP; i += 1) {
    objectScan(needles, { ...kwargs, strict: false })(haystack);
  }
  const compileSamples = [];
  const traverseSamples = [];
  for (let s = 0; s < SAMPLES; s += 1) {
    if (global.gc) global.gc();
    compileSamples.push(batchCompile(objectScan, needles, kwargs));
    if (global.gc) global.gc();
    traverseSamples.push(batchTraverse(objectScan, haystack, needles, kwargs));
  }
  return {
    compile: median(compileSamples),
    traverse: median(traverseSamples)
  };
};

export default ({
  objectScan,
  haystack,
  needles,
  useArraySelector = true,
  reverse = true,
  orderByNeedles = false
}) => {
  const logs = [];
  const cb = (cbName) => ({
    key,
    value,
    property,
    gproperty,
    parent,
    gparent,
    parents,
    isMatch,
    matchedBy,
    excludedBy,
    traversedBy,
    isCircular,
    isLeaf,
    depth,
    result
  }) => {
    logs.push({
      cbName,
      key,
      value,
      property,
      gproperty,
      parent,
      gparent,
      parents,
      isMatch,
      matchedBy,
      excludedBy,
      traversedBy,
      isCircular,
      isLeaf,
      depth,
      result: [...result]
    });
  };
  const kwargs = {
    useArraySelector,
    reverse,
    orderByNeedles
  };
  const result = objectScan(needles, {
    ...kwargs,
    strict: false,
    joined: true,
    filterFn: cb('filterFn'),
    breakFn: cb('breakFn')
  })(haystack);

  let warning = null;
  try {
    objectScan(needles, kwargs);
  } catch (e) {
    warning = e.message;
  }
  return {
    haystack,
    needles,
    kwargs,
    logs,
    warning,
    result
  };
};
