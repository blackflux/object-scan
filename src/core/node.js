export class Node extends Map {
  constructor(wildcard = null) {
    super();
    this.wildcard = wildcard;
    this.vs = [];
    this.match = false;
    this.matches = false;
    this.needles = [];
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
}
