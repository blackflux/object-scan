export default (lines) => {
  const result = [];
  let content = [];
  let startIndex = -1;
  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    if (startIndex !== -1) {
      if (line === '</example></pre>') {
        result.push([startIndex, idx, content]);
        startIndex = -1;
        content = [];
      } else {
        content.push(line);
      }
    } else if (lines[idx] === '<pre><example>') {
      startIndex = idx;
    }
  }
  return result;
};
