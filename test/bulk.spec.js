const path = require('path');
const { describe } = require('node-tdd');
const generateTest = require('./bulk/helper/generate-test');
const generateTests = require('./bulk/helper/generate-tests');
const instantiateTests = require('./bulk/helper/instantiate-tests');

// todo: in test generator generate combination of different intervals
// todo: check coverage of main logic
// todo: import released version of objectScan and compare results (?)
// todo: profile and improve performance

describe('Generating Bulk Test Coverage Tests', { useTmpDir: true }, () => {
  beforeEach(({ dir }) => {
    generateTest({ file: path.join(dir, 'file.json') });
    generateTest({ file: path.join(dir, 'file.json') });

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
