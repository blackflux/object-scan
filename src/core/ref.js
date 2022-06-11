export class Ref {
  excluded = false;

  constructor(type, link = null) {
    this.type = type;
    this.left = link === null;
    this.link = link === null ? new Ref(type, this) : link;
    this.node = null;
    this.isStarRec = this.type === '**';
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
