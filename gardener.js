// eslint-disable-next-line import/no-extraneous-dependencies
import gardener from 'js-gardener';

import { fileURLToPath } from 'url';
import process from 'process';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  gardener({
    skip: []
  }).catch(() => process.exit(1));
}
