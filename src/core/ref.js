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
