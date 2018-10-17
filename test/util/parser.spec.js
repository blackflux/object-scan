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

const checkError = (input, msg) => {
  let err;
  try {
    parse(input);
  } catch (e) {
    err = e;
  }
  expect(err.message).to.equal(msg);
};

describe("Testing Parser", () => {
  describe("Complex Use Cases", () => {
    it("Testing Path Groups", () => {
      expect(asString("{a,b.c}")).to.equal('{"a",["b","c"]}');
    });

    it("Testing Nested Groups", () => {
      expect(asString("{a,{b,c}}")).to.deep.equal('{"a",{"b","c"}}');
    });

    it("Testing Array Group Content", () => {
      expect(asString("[{1,{0,1}}]")).to.deep.equal('{"[1]",{"[0]","[1]"}}');
      expect(asString("[{{0,1},1}]")).to.deep.equal('{{"[0]","[1]"},"[1]"}');
    });
  });

  describe("Testing Simple Use Cases", () => {
    it("Testing Empty", () => {
      expect(parse("")).to.deep.equal("");
    });

    it("Testing Simple", () => {
      expect(parse("a")).to.deep.equal("a");
    });

    it("Testing Path", () => {
      expect(parse("a.b")).to.deep.equal(["a", "b"]);
    });

    it("Testing Array", () => {
      expect(parse("a[0]")).to.deep.equal(["a", "[0]"]);
    });

    it("Testing Or", () => {
      expect(parse("{a,b}")).to.deep.equal(["a", "b"]);
    });

    it("Testing Comma Outside Group", () => {
      expect(parse("a,b")).to.deep.equal(["a", "b"]);
      expect(parse("a.b,c.d")).to.deep.equal([["a", "b"], ["c", "d"]]);
    });

    it("Testing Or In Array", () => {
      expect(parse("[{0,1}]")).to.deep.equal(["[0]", "[1]"]);
    });

    it("Testing Array In Or", () => {
      expect(parse("{[0],[1]}")).to.deep.equal(["[0]", "[1]"]);
    });

    it("Testing Array in Path", () => {
      expect(parse("a.*.c[0]")).to.deep.equal(["a", "*", "c", "[0]"]);
    });

    it("Testing Array After Or", () => {
      expect(parse("{a,b}[0]")).to.deep.equal([['a', 'b'], '[0]']);
    });
  });

  describe("Testing Escaping", () => {
    it("Testing Path Escaped", () => {
      expect(parse("a\\.b")).to.deep.equal("a\\.b");
    });

    it("Testing Or Escaped", () => {
      expect(parse("{a\\,b}")).to.deep.equal("a\\,b");
    });

    it("Testing Escaped final Dot", () => {
      expect(parse("a.\\.")).to.deep.equal(["a", "\\."]);
    });
  });

  describe("Invalid Dot Selector", () => {
    it("Testing Starts with Dot", () => {
      checkError(".a", "Bad Path Separator: .a, char 0");
    });

    it("Testing Ends with Dot", () => {
      checkError("a.", "Bad Terminator: a., char 2");
    });

    it("Testing Double Dot", () => {
      checkError("a..b", "Bad Path Separator: a..b, char 2");
    });
  });

  describe("Array Selector", () => {
    it("Testing Empty Array", () => {
      checkError("[]", "Bad Array Terminator: [], char 1");
    });

    it("Testing Invalid Array Content", () => {
      checkError("[a]", "Bad Array Selector: [a], selector a");
    });

    it("Testing Invalid Array Group Content", () => {
      checkError("[{1,{0,1,a}}]", "Bad Array Selector: [{1,{0,1,a}}], selector a");
    });

    it("Testing Only Opening Bracket", () => {
      checkError("[{1}", "Non Terminated Array: [{1}");
    });

    it("Testing Starts with Bracket", () => {
      checkError("[a", "Bad Array Selector: [a, selector a");
    });

    it("Testing Ends with Bracket", () => {
      checkError("a]", "Bad Array Terminator: a], char 1");
    });

    it("Testing Nested Array Notation", () => {
      checkError("[[", "Bad Array Start: [[, char 1");
    });

    it("Testing Double Nested Array In Group", () => {
      checkError("[{1,[2]}]", "Bad Array Start: [{1,[2]}], char 4");
    });

    it("Testing Or In Array Escaped (Invalid Group)", () => {
      checkError("[{0\\,1}]", "Bad Array Selector: [{0\\,1}], selector 0\\,1");
    });

    it("Testing Array Escaped", () => {
      checkError("a\\[0]", "Bad Array Terminator: a\\[0], char 4");
    });
  });

  describe("Simple Group Selector", () => {
    it("Testing Starts with Curly Bracket", () => {
      checkError("{a", "Non Terminated Group: {a");
    });

    it("Testing Ends with Curly Bracket", () => {
      checkError("a}", "Unexpected Group Terminator: a}, char 1");
    });

    it("Testing Group Starts with Comma", () => {
      checkError("{,1,2}", "Bad Group Separator: {,1,2}, char 1");
    });

    it("Testing Group Ends with Comma", () => {
      checkError("{1,2,}", "Bad Group Terminator: {1,2,}, char 5");
    });

    it("Testing Group Stars After Element", () => {
      checkError("\\.{2,3}", "Bad Group Start: \\.{2,3}, char 2");
    });

    it("Testing Group Stars After Group", () => {
      checkError("{1,2}{2,3}", "Bad Group Start: {1,2}{2,3}, char 5");
    });
  });
});
