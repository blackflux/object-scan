const path = require('path');
const { describe } = require('node-tdd');
const generateTests = require('./bulk/helper/generate-tests');
const instantiateTests = require('./bulk/helper/instantiate-tests');

// todo: check coverage of main logic
// todo: import released version of objectScan and compare results (?)
// todo: profile and improve performance

describe('Generating Bulk Test Coverage Tests', { useTmpDir: true }, () => {
  beforeEach(({ dir }) => {
    generateTests({ folder: dir, count: 1 });
    generateTests({ folder: dir, count: 1 });

    describe('Running Bulk Test Coverage Tests', () => {
      instantiateTests({ folder: dir, init: true });
      instantiateTests({ folder: dir });
    });
  });

  it('ok', () => {});
});

describe('Generating Bulk Tests', { timeout: 60000 }, () => {
  beforeEach(() => {
    const folder = path.join(__dirname, 'bulk', 'generated');
    generateTests({ folder });

    describe('Running Bulk Tests', () => {
      instantiateTests({ folder });
    });
  });

  it('ok', () => {});
});
