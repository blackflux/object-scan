import objectScanReleased from 'object-scan';
import objectScanLocal from '../src/index';

import callSignature from './helper/call-signature';

process.on('message', ({
  haystack,
  needles,
  useArraySelector,
  reverse,
  orderByNeedles,
  useLocal
}) => {
  const result = callSignature({
    objectScan: useLocal ? objectScanLocal : objectScanReleased,
    haystack,
    needles,
    useArraySelector,
    reverse,
    orderByNeedles
  });
  process.send(result);
});

process.on('exit', () => {
  process.exit(0);
});
