export class Ref {
  excluded = false;

  constructor(typeOrRef) {
    if (typeOrRef instanceof Ref) {
      this.type = typeOrRef.type;
      this.left = false;
      this.link = typeOrRef;
      // eslint-disable-next-line no-param-reassign
      typeOrRef.link = this;
    } else {
      this.type = typeOrRef;
      this.left = true;
      this.link = null;
    }
    this.isStarRec = this.type === '**';
    this.node = null;
    this.completed = false;
  }

  setNode(node) {
    this.node = node;
    this.link.node = node;
  }

  setCompleted(state) {
    this.completed = state;
    this.link.completed = state;
  }
}
