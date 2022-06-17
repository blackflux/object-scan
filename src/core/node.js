// todo: can we make this not a map
// todo: move wildcard logic in here and cache
export class Node {
  constructor(wildcard, ctx) {
    ctx.nodes.push(this);
    this.ctx = ctx;
    this.wildcard = wildcard;
    this.order = ctx.counter;
    this.vs = [];
    this.match = false;
    this.matches = false;
    this.needles = [];
    this.leafNeedles = [];
    this.leafNeedlesExclude = [];
    this.leafNeedlesMatch = [];
  }

  add(v) {
    this.vs.push(v);
  }

  has(k) {
    return this.vs.some(({ wildcard }) => wildcard.value === k);
  }

  get(k) {
    return this.vs.find(({ wildcard }) => wildcard.value === k);
  }

  markMatches() {
    this.matches = true;
  }

  addNeedle(needle) {
    if (!this.needles.includes(needle)) {
      this.needles.push(needle);
    }
  }

  setRoots(roots) {
    this.roots = roots;
  }

  finish(needle, excluded, index) {
    this.addNeedle(needle);
    if (!this.leafNeedles.includes(needle)) {
      this.leafNeedles.push(needle);
    }
    const target = excluded ? this.leafNeedlesExclude : this.leafNeedlesMatch;
    if (!target.includes(needle)) {
      target.push(needle);
    }
    this.match = !excluded;
    this.matches = this.match;
    this.index = index;
  }
}
