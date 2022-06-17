export class Node extends Map {
  constructor(wildcard = null, order = null) {
    super();
    this.wildcard = wildcard;
    this.order = order;
    this.vs = [];
    this.match = false;
    this.matches = false;
    this.needles = [];
    this.leafNeedles = [];
    this.leafNeedlesExclude = [];
    this.leafNeedlesMatch = [];
  }

  set(k, v) {
    super.set(k, v);
    this.vs.splice(0, 0, v);
  }

  setMatch(match) {
    this.match = match;
    this.matches = match;
  }

  markMatches() {
    this.matches = true;
  }

  addNeedle(needle) {
    if (!this.needles.includes(needle)) {
      this.needles.push(needle);
    }
  }

  setIndex(index) {
    this.index = index;
  }

  setRoots(roots) {
    this.roots = roots;
  }

  addLeafNeedle(needle) {
    if (!this.leafNeedles.includes(needle)) {
      this.leafNeedles.push(needle);
    }
  }

  addLeafNeedleExclude(needle) {
    if (!this.leafNeedlesExclude.includes(needle)) {
      this.leafNeedlesExclude.push(needle);
    }
  }

  addLeafNeedleMatch(needle) {
    if (!this.leafNeedlesMatch.includes(needle)) {
      this.leafNeedlesMatch.push(needle);
    }
  }
}
