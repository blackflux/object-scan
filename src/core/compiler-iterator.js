import iterator from '../generic/iterator.js';

export default (tower, needle, tree, { onAdd, onFin }) => {
  const stack = [[[tower, null]]];
  let excluded = false;

  iterator.iterate(tree, (type, wc) => {
    if (type === 'RM') {
      if (wc.excluded === true) {
        excluded = false;
      }
      stack.length -= 2;
    } else if (type === 'ADD') {
      if (wc.excluded === true) {
        if (excluded) {
          throw new Error(`Redundant Exclusion: "${needle}"`);
        }
        excluded = true;
      }
      const toAdd = [];
      const wcParent = stack[stack.length - 2];
      stack[stack.length - 1]
        .forEach(([cur, parent]) => onAdd(cur, parent, wc, wcParent, (e) => toAdd.push([e, cur])));
      stack.push(wc, toAdd);
    } else {
      stack[stack.length - 1]
        .filter(([cur]) => cur !== tower)
        .forEach(([cur, parent]) => onFin(cur, parent, wc[wc.length - 1], excluded));
    }
  });
};
