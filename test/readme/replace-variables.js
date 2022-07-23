import sizeBadge from './replace-variables/size-badge.js';
import ratioBadge from './replace-variables/ratio-badge.js';
import toc from './replace-variables/toc.js';
import competitorBenchmark from './replace-variables/competitor-benchmark.js';

const LOOKUP = {
  SIZE_BADGE: sizeBadge,
  RATIO_BADGE: ratioBadge,
  TOC: toc,
  CMP_BMK: competitorBenchmark
};

export default async (lines_) => {
  const lines = [...lines_];
  for (let idx = 0; idx < lines.length;) {
    const line = lines[idx];
    if (!(line.startsWith('${') && line.endsWith('}'))) {
      idx += 1;
      // eslint-disable-next-line no-continue
      continue;
    }
    const variable = line.slice(2, -1);
    const result = [];
    // eslint-disable-next-line no-await-in-loop
    result.push(...(await LOOKUP[variable](lines)));
    lines.splice(idx, 1, ...result);
    idx += result.length;
  }
  return lines;
};
