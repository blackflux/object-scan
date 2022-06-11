export class Ref {
  excluded = false;

  constructor(type, link = null) {
    this.type = type;
    this.left = link === null;
    this.link = link;
    this.node = null;
    this.isStarRec = this.type === '**';
    this.pointer = null;
  }

  close() {
    const ref = new Ref(this.type, this);
    this.link = ref;
    return ref;
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
