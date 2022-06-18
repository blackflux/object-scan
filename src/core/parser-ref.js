export class Ref {
  constructor(type, link = null) {
    this.left = link === null;
    this.link = link === null ? new Ref(type, this) : link;
    this.type = type;
    this.isStarRec = this.type === '**';
    this.node = null;
    this.pointer = null;
  }

  setPointer(pointer) {
    this.pointer = pointer;
    this.link.pointer = pointer;
  }

  setNode(node) {
    this.node = node;
    this.link.node = node;
  }
}
