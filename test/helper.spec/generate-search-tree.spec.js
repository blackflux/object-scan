const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateSearchTree = require('../helper/generate-search-tree');

describe('Testing generate-search-tree.js', { cryptoSeed: '7075fb6c-d873-4675-99b9-817ca113a78e' }, () => {
  it('Testing example', () => {
    expect(generateSearchTree()).to.deep.equal({
      a: {
        a: {
          7: {},
          8: {
            8: {
              8: { 8: {}, 9: {}, a: {} }, c: {}, d: {}, e: {}, f: {}, g: {}, h: {}
            },
            j: {},
            k: {}
          },
          a: {},
          b: {
            4: {},
            5: {},
            b: {},
            c: {},
            d: {},
            e: {},
            f: {
              1: {},
              2: {},
              f: {
                f: {}, g: {}, h: {}, i: {}, j: {}, k: {}, l: {}
              },
              n: {},
              o: {},
              p: {
                p: {
                  p: {}, q: {}, r: {}, s: {}, t: {}, u: {}
                },
                w: {
                  w: {}, x: {}, y: {}, z: {}, A: {}, B: {}
                },
                D: {
                  D: {}, E: {}, F: {}, G: {}
                },
                I: {},
                J: {},
                K: {}
              },
              M: {
                M: {},
                N: {},
                O: {},
                P: {},
                Q: {},
                R: {},
                S: {
                  S: {}, T: {}, U: {}, V: {}, W: {}, X: {}, Y: {}
                }
              }
            }
          },
          m: {},
          n: {},
          o: {}
        },
        q: {},
        r: {},
        s: {},
        t: {}
      },
      v: {},
      w: {},
      x: {},
      y: {},
      z: {},
      A: {}
    });
  });
});
