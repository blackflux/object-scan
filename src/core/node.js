export class Node extends Map {
  constructor(wildcard = null) {
    super();
    this.wildcard = wildcard;
    this.vs = [];
  }

  set(k, v) {
    super.set(k, v);
    this.vs.splice(0, 0, v);
  }
}
