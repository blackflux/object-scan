const expect = require('chai').expect;
const compiler = require("./../../src/util/compiler");

describe("Testing compiler", () => {
  it("Testing traversing", () => {
    const input = ["a.{b,c}.d", "a.{c,e}.f", "a.b.d.g"];
    const result = compiler.compile(input);
    expect(result).to.deep.equal({
      a: {
        b: {
          d: {
            g: {}
          }
        },
        c: {
          d: {},
          f: {}
        },
        e: {
          f: {}
        }
      }
    });

    expect(compiler.isFinal(result)).to.equal(false);
    expect(compiler.isFinal(result.a)).to.equal(false);
    expect(compiler.isFinal(result.a.b)).to.equal(false);
    expect(compiler.isFinal(result.a.b.d)).to.equal(true);
    expect(compiler.isFinal(result.a.b.d.g)).to.equal(true);
    expect(compiler.isFinal(result.a.c)).to.equal(false);
    expect(compiler.isFinal(result.a.c.d)).to.equal(true);
    expect(compiler.isFinal(result.a.c.f)).to.equal(true);
    expect(compiler.isFinal(result.a.e)).to.equal(false);
    expect(compiler.isFinal(result.a.e.f)).to.equal(true);

    expect(compiler.getNeedles(result)).to.deep.equal(["a.{b,c}.d", "a.{c,e}.f", "a.b.d.g"]);
    expect(compiler.getNeedles(result.a)).to.deep.equal(["a.{b,c}.d", "a.{c,e}.f", "a.b.d.g"]);
    expect(compiler.getNeedles(result.a.b)).to.deep.equal(["a.{b,c}.d", "a.b.d.g"]);
    expect(compiler.getNeedles(result.a.b.d)).to.deep.equal(["a.{b,c}.d", "a.b.d.g"]);
    expect(compiler.getNeedles(result.a.b.d.g)).to.deep.equal(["a.b.d.g"]);
    expect(compiler.getNeedles(result.a.c)).to.deep.equal(["a.{b,c}.d", "a.{c,e}.f"]);
    expect(compiler.getNeedles(result.a.c.d)).to.deep.equal(["a.{b,c}.d"]);
    expect(compiler.getNeedles(result.a.c.f)).to.deep.equal(["a.{c,e}.f"]);
    expect(compiler.getNeedles(result.a.e)).to.deep.equal(["a.{c,e}.f"]);
    expect(compiler.getNeedles(result.a.e.f)).to.deep.equal(["a.{c,e}.f"]);
  });
});
