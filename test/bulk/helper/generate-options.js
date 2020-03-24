const assert = require('assert');

module.exports = ({ useArraySelector }) => {
  assert(typeof useArraySelector === 'function');
  return {
    useArraySelector: useArraySelector()
  };
};
