export class Node extends Map {
  constructor() {
    super();
    this.vs = [];
  }

  set(k, v) {
    super.set(k, v);
    this.vs.splice(0, 0, v);
  }
}
