export default async (str, regex, asyncFn) => {
  const tasks = [];
  str.replace(regex, (match, ...args) => {
    tasks.push(() => asyncFn(match, ...args));
  });
  const data = [];
  for (let i = 0; i < tasks.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    data.push(await tasks[i]());
  }
  return str.replace(regex, () => data.shift());
};
