const assert = require("assert");
const expect = require('chai').expect;
const { parse, isOr } = require("./../../src/util/parser");

const asString = (() => {
  const asStringRec = (input) => {
    if (Array.isArray(input)) {
      const isOrArray = isOr(input);
      return `${isOrArray ? "{" : "["}${input.map(e => asStringRec(e)).join(",")}${isOrArray ? "}" : "]"}`;
    }
    assert(typeof input === "string");
    return `"${input}"`;
  };
  return input => asStringRec(parse(input));
})();

describe("Testing Parser", () => {
  describe("Complex Use Cases", () => {
    it("Testing Path Groups", () => {
      expect(asString("{a,b.c}")).to.equal('[{"a",["b","c"]}]');
    });

    it("Testing Nested Groups", () => {
      expect(asString("{a,{b,c}}")).to.deep.equal('[{"a",{"b","c"}}]');
    });

    it("Testing List Group Content", () => {
      expect(asString("[{1,{0,1}}]")).to.deep.equal('[{"[1]",{"[0]","[1]"}}]');
      expect(asString("[{{0,1},1}]")).to.deep.equal('[{{"[0]","[1]"},"[1]"}]');
    });
  });

  describe("Testing Simple Use Cases", () => {
    it("Testing Empty", () => {
      expect(parse("")).to.deep.equal([""]);
    });

    it("Testing Simple", () => {
      expect(parse("a")).to.deep.equal(["a"]);
    });

    it("Testing Path", () => {
      expect(parse("a.b")).to.deep.equal(["a", "b"]);
    });

    it("Testing List", () => {
      expect(parse("a[0]")).to.deep.equal(["a", "[0]"]);
    });

    it("Testing Or", () => {
      expect(parse("{a,b}")).to.deep.equal([["a", "b"]]);
    });

    it("Testing Or In List", () => {
      expect(parse("[{0,1}]")).to.deep.equal([["[0]", "[1]"]]);
    });

    it("Testing List In Or", () => {
      expect(parse("{[0],[1]}")).to.deep.equal([["[0]", "[1]"]]);
    });

    it("Testing List in Path", () => {
      expect(parse("a.*.c[0]")).to.deep.equal(["a", "*", "c", "[0]"]);
    });

    it("Testing List After Or", () => {
      expect(parse("{a,b}[0]")).to.deep.equal([['a', 'b'], '[0]']);
    });
  });

  describe("Testing Escaping", () => {
    it("Testing Path Escaped", () => {
      expect(parse("a\\.b")).to.deep.equal(["a\\.b"]);
    });

    it("Testing Or Escaped", () => {
      expect(parse("{a\\,b}")).to.deep.equal(["a\\,b"]);
    });

    it("Testing Escaped final Dot", () => {
      expect(parse("a.\\.")).to.deep.equal(["a", "\\."]);
    });
  });

  describe("Invalid Dot Selector", () => {
    it("Testing Starts with Dot", () => {
      expect(() => parse(".a")).to.throw("Bad Path Separator: .a, char 0");
    });

    it("Testing Ends with Dot", () => {
      expect(() => parse("a.")).to.throw("Bad Path Separator: a., char 1");
    });

    it("Testing Double Dot", () => {
      expect(() => parse("a..b")).to.throw("Bad Path Separator: a..b, char 2");
    });
  });

  describe("List Selector", () => {
    it("Testing Empty List", () => {
      expect(() => parse("[]")).to.throw("Bad List Terminator: [], char 1");
    });

    it("Testing Invalid List Content", () => {
      expect(() => parse("[a]")).to.throw("Bad List Selector: [a], selector a");
    });

    it("Testing Invalid List Group Content", () => {
      expect(() => parse("[{1,{0,1,a}}]")).to.throw("Bad List Selector: [{1,{0,1,a}}], selector a");
    });

    it("Testing Only Opening Bracket", () => {
      expect(() => parse("[")).to.throw("Non Terminated List: [");
    });

    it("Testing Starts with Bracket", () => {
      expect(() => parse("[a")).to.throw("Bad List Selector: [a, selector a");
    });

    it("Testing Ends with Bracket", () => {
      expect(() => parse("a]")).to.throw("Bad List Terminator: a], char 1");
    });

    it("Testing Nested List Notation", () => {
      expect(() => parse("[[")).to.throw("Bad List Start: [[, char 1");
    });

    it("Testing Double Nested List In Group", () => {
      expect(() => parse("[{1,[2]}]")).to.throw("Bad List Start: [{1,[2]}], char 4");
    });

    it("Testing Or In List Escaped (Invalid Group)", () => {
      expect(() => parse("[{0\\,1}]")).to.throw("Bad List Selector: [{0\\,1}], selector 0\\,1");
    });

    it("Testing List Escaped", () => {
      expect(() => parse("a\\[0]")).to.throw("Bad List Terminator: a\\[0], char 4");
    });
  });

  describe("Simple Group Selector", () => {
    it("Testing Comma Outside Group", () => {
      expect(() => parse("a,b")).to.throw("Bad Group Separator: a,b, char 1");
    });

    it("Testing Starts with Curly Bracket", () => {
      expect(() => parse("{a")).to.throw("Non Terminated Group: {a");
    });

    it("Testing Ends with Curly Bracket", () => {
      expect(() => parse("a}")).to.throw("Bad Group Terminator: a}, char 1");
    });

    it("Testing Group Starts with Comma", () => {
      expect(() => parse("{,1,2}")).to.throw("Bad Group Separator: {,1,2}, char 1");
    });

    it("Testing Group Ends with Comma", () => {
      expect(() => parse("{1,2,}")).to.throw("Bad Group Terminator: {1,2,}, char 5");
    });

    it("Testing Group Stars After Element", () => {
      expect(() => parse("\\.{2,3}")).to.throw("Bad Group Start: \\.{2,3}, char 2");
    });

    it("Testing Group Stars After Group", () => {
      expect(() => parse("{1,2}{2,3}")).to.throw("Bad Group Start: {1,2}{2,3}, char 5");
    });
  });
});
