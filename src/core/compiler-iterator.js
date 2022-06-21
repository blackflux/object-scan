import iterator from '../generic/iterator.js';

export default (tower, needle, tree, { onAdd, onFin }) => {
  const stack = [[[tower, null]]];
  let excluded = false;

  iterator(tree, (type, v) => {
    if (type === 'RM') {
      if (v.excluded === true) {
        excluded = false;
      }
      stack.length -= 2;
    } else if (type === 'ADD') {
      if (v.excluded === true) {
        if (excluded) {
          throw new Error(`Redundant Exclusion: "${needle}"`);
        }
        excluded = true;
      }
      const toAdd = [];
      const vParent = stack[stack.length - 2];
      stack[stack.length - 1]
        .forEach(([cur, parent]) => onAdd(cur, parent, v, vParent, (e) => toAdd.push([e, cur])));
      stack.push(v, toAdd);
    } else {
      stack[stack.length - 1]
        .filter(([cur]) => cur !== tower)
        .forEach(([cur, parent]) => onFin(cur, parent, v, excluded));
    }
  });
};
