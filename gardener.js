// eslint-disable-next-line import/no-extraneous-dependencies
const gardener = require('js-gardener');

if (require.main === module) {
  gardener({
    author: "Lukas Siemon"
  }).catch(() => process.exit(1));
}
