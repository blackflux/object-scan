export class AccessLogger {
  constructor(obj) {
    const logs = [];
    const prepare = (o) => {
      const entries = Object.entries(o);
      const result = {};
      for (let i = 0; i < entries.length; i += 1) {
        const [k, v] = entries[i];
        const value = prepare(v);
        result[k] = value;
        Object.defineProperty(result, k, {
          get() {
            logs.push(k);
            return value;
          }
        });
      }
      return result;
    };
    this.logs = logs;
    this.obj = prepare(obj);
  }

  reset() {
    return this.logs.splice(0);
  }
}
