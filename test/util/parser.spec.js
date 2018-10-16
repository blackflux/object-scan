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

  it("Testing Or", () => {
    expect(parser("{a,b}")).to.deep.equal([["a", "b"]]);
  });

  it("Testing Or Nested", () => {
    expect(parser("{a,b.c}")).to.deep.equal([["a", "b", "c"]]);
  });

  it("Testing Or Escaped", () => {
    expect(parser("{a\\,b}")).to.deep.equal([["a\\,b"]]);
  });

  it("Testing Or In List", () => {
    expect(parser("[{0,1}]")).to.deep.equal([["[0]", "[1]"]]);
  });

  it("Testing List in Path", () => {
    expect(parser("a.*.c[0]")).to.deep.equal(["a", "*", "c", "[0]"]);
  });

  describe("Invalid Dot Selector", () => {
    it("Testing Starts with Dot", () => {
      expect(() => parser(".a")).to.throw("Bad Path Separator: .a, char 0");
    });

    it("Testing Ends with Dot", () => {
      expect(() => parser("a.")).to.throw("Bad Path Separator: a., char 1");
    });
  });

  describe("List Selector", () => {
    it("Testing Invalid List Content", () => {
      expect(() => parser("[a]")).to.throw("Bad List Selector: [a], selector a");
    });

    it("Testing Starts with Bracket", () => {
      expect(() => parser("[a")).to.throw("Non Terminated List Separator: [a");
    });

    it("Testing Ends with Bracket", () => {
      expect(() => parser("a]")).to.throw("Bad List Selector: a], char 1");
    });

    it("Testing Nested List Notation", () => {
      expect(() => parser("[[")).to.throw("Bad List Selector: [[, char 1");
    });

    it("Testing Or In List Escaped (Invalid Group)", () => {
      expect(() => parser("[{0\\,1}]")).to.throw("Bad List Selector: [{0\\,1}], selector 0\\,1");
    });

    it("Testing List Escaped", () => {
      expect(() => parser("a\\[0]")).to.throw("Bad List Selector: a\\[0], char 4");
    });
  });

  describe("Simple Group Selector", () => {
    it("Testing Starts with Curly Bracket", () => {
      expect(() => parser("{a")).to.throw("Non Terminated Group Separator: {a");
    });

    it("Testing Ends with Curly Bracket", () => {
      expect(() => parser("a}")).to.throw("Bad Group Selector: a}, char 1");
    });

    it("Testing Group Starts with Comma", () => {
      expect(() => parser("{,1,2}")).to.throw("Bad Group Separator: {,1,2}, char 1");
    });

    it("Testing Group Ends with Comma", () => {
      expect(() => parser("{1,2,}")).to.throw("Bad Group Separator: {1,2,}, char 4");
    });

    it("Testing Group Stars After Element", () => {
      expect(() => parser("\\.{2,3}")).to.throw("Bad Group Start: \\.{2,3}, char 2");
    });

    it("Testing Group Stars After Group", () => {
      expect(() => parser("{1,2}{2,3}")).to.throw("Bad Group Start: {1,2}{2,3}, char 5");
    });
  });
});
