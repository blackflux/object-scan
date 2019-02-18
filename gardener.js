// eslint-disable-next-line import/no-extraneous-dependencies
const gardener = require('js-gardener');

if (require.main === module) {
  gardener({
    author: 'Lukas Siemon',
    ci: ['circle'],
    dependabot: true
  }).catch(() => process.exit(1));
}
