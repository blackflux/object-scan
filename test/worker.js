import objectScanReleased from 'object-scan';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

import callSignature from './helper/call-signature.js';

// Prefer the built artifact (lib/) when present so the local side is compared
// build-vs-build against the released package. Fall back to src/ when the
// project has not been built (e.g. during development).
const localEntry = existsSync(join(fileURLToPath(new URL('.', import.meta.url)), '..', 'lib', 'index.js'))
  ? join(fileURLToPath(new URL('.', import.meta.url)), '..', 'lib', 'index.js')
  : join(fileURLToPath(new URL('.', import.meta.url)), '..', 'src', 'index.js');
const objectScanLocal = (await import(localEntry)).default;

process.send('ready');

process.on('message', (msg) => {
  if (msg === 'exit') {
    process.exit(0);
    return;
  }
  const {
    haystack,
    needles,
    useArraySelector,
    reverse,
    orderByNeedles,
    useLocal
  } = msg;
  try {
    const result = callSignature({
      objectScan: useLocal ? objectScanLocal : objectScanReleased,
      haystack,
      needles,
      useArraySelector,
      reverse,
      orderByNeedles
    });
    process.send(result);
  } catch (err) {
    process.send({ error: err.message });
  }
});

process.on('exit', () => {
  process.exit(0);
});
