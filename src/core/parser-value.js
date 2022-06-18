export class Value {
  constructor(value, excluded) {
    this.value = value;
    this.excluded = excluded;
    this.isSimpleStarRec = value === '**';
    this.isRegexStarRec = value.startsWith('**(') && value.endsWith(')');
    this.isStarRec = this.isSimpleStarRec || this.isRegexStarRec;
  }
}
