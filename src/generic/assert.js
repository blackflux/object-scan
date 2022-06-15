export default (condition, message = 'Internal Logic Error') => {
  if (!condition) {
    throw new Error(typeof message === 'function' ? message() : message);
  }
};
