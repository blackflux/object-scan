export class Node extends Map {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super();
    this.vs = [];
  }

  set(k, v) {
    super.set(k, v);
    this.vs.splice(0, 0, v);
  }
}
