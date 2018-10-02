const expect = require('chai').expect;
const parser = require("./../../src/util/parser");

describe("Testing Parser", () => {
  it("Testing Simple", () => {
    expect(parser("a")).to.deep.equal(["a"]);
  });

  it("Testing Empty", () => {
    expect(parser("")).to.deep.equal([""]);
  });

  it("Testing Path", () => {
    expect(parser("a.b")).to.deep.equal(["a", "b"]);
  });

  it("Testing Path Escaped", () => {
    expect(parser("a\\.b")).to.deep.equal(["a\\.b"]);
  });

  it("Testing List", () => {
    expect(parser("a[0]")).to.deep.equal(["a", "[0]"]);
  });

  it("Testing List Escaped", () => {
    expect(parser("a\\[0]")).to.deep.equal(["a\\[0]"]);
  });

  it("Testing Or", () => {
    expect(parser("{a,b}")).to.deep.equal([["a", "b"]]);
  });

  it("Testing Or Escaped", () => {
    expect(parser("{a\\,b}")).to.deep.equal([["a\\,b"]]);
  });

  it("Testing Or In List", () => {
    expect(parser("[{0,1}]")).to.deep.equal([["[0]", "[1]"]]);
  });

  it("Testing Or In List Escaped (Invalid Group)", () => {
    expect(parser("[{0\\,1}]")).to.deep.equal(["[{0\\,1}]"]);
  });

  it("Testing List in Path", () => {
    expect(parser("a.*.c[0]")).to.deep.equal(["a", "*", "c", "[0]"]);
  });

  it("Testing Starts with Dot", () => {
    expect(parser(".a")).to.deep.equal([".a"]);
  });

  it("Testing Ends with Dot", () => {
    expect(parser("a.")).to.deep.equal(["a."]);
  });

  it("Testing Starts with Bracket", () => {
    expect(parser("[a")).to.deep.equal(["[a"]);
  });

  it("Testing Ends with Bracket", () => {
    expect(parser("a[")).to.deep.equal(["a["]);
  });

  it("Testing Group Starts with Comma", () => {
    expect(parser("{,1,2}")).to.deep.equal([[",1", "2"]]);
  });

  it("Testing Group Ends with Comma", () => {
    expect(parser("{1,2,}")).to.deep.equal([["1", "2,"]]);
  });
});
