const expect = require('chai').expect;
const objectScan = require("./..//src/index");

const haystack = {
  simple: "a",
  parent1: {
    child: "b"
  },
  parent2: {
    child: "c"
  },
  parent3: {
    child: {
      grandchild: "d"
    }
  },
  array1: ["a", "b", "c"],
  array2: {
    nested: ["a", "b", "c"]
  },
  array3: [{
    item: "e"
  }, {
    item: "f"
  }]
};

describe("Testing Find", () => {
  it("Testing Top Level Exact", () => {
    const find = objectScan(["simple"]);
    expect(find(haystack)).to.deep.equal([
      "simple"
    ]);
  });

  it("Testing Path Exact", () => {
    const find = objectScan(["parent1.child"]);
    expect(find(haystack)).to.deep.equal([
      "parent1.child"
    ]);
  });

  it("Testing Path Star", () => {
    const find = objectScan(["*.child"]);
    expect(find(haystack)).to.deep.equal([
      "parent1.child",
      "parent2.child",
      "parent3.child"
    ]);
  });

  it("Testing Array Top Level", () => {
    const find = objectScan(["[*]"]);
    expect(find(haystack.array1)).to.deep.equal([
      "[0]",
      "[1]",
      "[2]"
    ]);
  });

  it("Testing Array Star", () => {
    const find = objectScan(["array1[*]"]);
    expect(find(haystack)).to.deep.equal([
      "array1[0]",
      "array1[1]",
      "array1[2]"
    ]);
  });

  it("Testing Array Exact", () => {
    const find = objectScan(["array1[1]"]);
    expect(find(haystack)).to.deep.equal([
      "array1[1]"
    ]);
  });

  it("Testing Array Nested Star", () => {
    const find = objectScan(["array2.nested[*]"]);
    expect(find(haystack)).to.deep.equal([
      "array2.nested[0]",
      "array2.nested[1]",
      "array2.nested[2]"
    ]);
  });

  it("Testing Object Array", () => {
    const find = objectScan(["array3[*].item"]);
    expect(find(haystack)).to.deep.equal([
      "array3[0].item",
      "array3[1].item"
    ]);
  });
});
