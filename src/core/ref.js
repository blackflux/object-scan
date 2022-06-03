export class Ref {
  constructor(typeOrRef, id) {
    if (typeOrRef instanceof Ref) {
      this.type = typeOrRef.type;
      this.id = typeOrRef.id;
      this.left = false;
      this.link = typeOrRef;
      // eslint-disable-next-line no-param-reassign
      typeOrRef.link = this;
    } else {
      this.type = typeOrRef;
      this.id = id;
      this.left = true;
      this.link = null;
    }
    this.node = null;
    this.marked = false;
  }

  setNode(node) {
    this.node = node;
    this.link.node = node;
  }

  setMarked(state) {
    this.marked = state;
    this.link.marked = state;
  }

  toString() {
    return `<${[
      this.left ? '' : '}',
      this.left ? this.type : this.id,
      this.left ? this.id : this.type,
      this.left ? '{' : ''
    ]
      .filter((e) => !!e)
      .join(':')}>`;
  }
}
