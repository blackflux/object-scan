const expect = require('chai').expect;
const { describe } = require('node-tdd');
const objectScan = require('../../src/index');

describe('Testing useArraySelector', () => {
  describe('Testing useArraySelector=false + root matching', () => {
    let tester;
    before(() => {
      tester = (haystack, needles, expected) => {
        const r = objectScan(needles, {
          useArraySelector: false,
          joined: true
        })(haystack);
        expect(r).to.deep.equal(expected);
      };
    });

    it('Testing matches isLeaf', () => {
      tester(
        [1, [2, { x: 3 }]],
        ['**(^x$)'],
        ['[1][1].x', '[1][1]', '[1][0]', '[0]']
      );
    });

    it('Testing multiple star recursion', () => {
      tester(
        [[{ x: { y: 1 }, y: { x: 2 } }]],
        ['**(^x$).**(^y$)'],
        ['[0][0].y', '[0][0].x.y', '[0][0].x', '[0][0]']
      );
    });

    it('Testing not plus recursion', () => {
      tester(
        [1, [2, { x: 3 }]],
        ['++(^x$)'],
        ['[1][1].x']
      );
    });

    it('Testing empty string matches empty root', () => {
      tester({}, [''], ['']);
    });

    it('Testing empty string and others', () => {
      tester(
        // eslint-disable-next-line object-curly-newline
        { cross: 0, 't/y': 1, perhaps: 2, waste: 3, dog: 4, afternoon: 5 },
        ['after*oon', 'cros*', '', '!wa*', 'dog.**', '!t/y'],
        ['afternoon', 'dog', 'cross', '']
      );
    });

    it('Testing multiple star recursions', () => {
      tester(
        [[{ a: 1, b: 2 }], [{ b: 3 }, { a: 4 }]],
        ['', '**(^a$)', '**(^b$)'],
        ['[1][1].a', '[1][1]', '[1][0].b', '[1][0]', '[0][0].b', '[0][0].a', '[0][0]']
      );
    });

    it('Testing root match negated by star recursion root match', () => {
      tester([0, 1], ['', '!**'], []);
    });

    it('Testing symmetry', () => {
      const logs = [];
      objectScan(['**'], {
        useArraySelector: false,
        joined: true,
        filterFn: ({ key }) => {
          logs.push(`filter: ${key}`);
        },
        breakFn: ({ key }) => {
          logs.push(`breakFn: ${key}`);
        }
      })([0]);
      expect(logs).to.deep.equal([
        'breakFn: ',
        'breakFn: [0]',
        'filter: [0]'
      ]);
    });
  });
});
