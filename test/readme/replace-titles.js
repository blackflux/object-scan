export default (lines_) => {
  const lines = [...lines_];
  const stack = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.startsWith('##')) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const [indent, ...title] = line.split(' ');
    const type = indent.length - 2;
    stack.length = type + 1;
    if (!stack[type]) {
      stack[type] = 0;
    }
    stack[type] += 1;
    const number = `${stack.join('.')}.`;
    lines[i] = [indent, number, ...title].join(' ');
  }
  return lines;
};
