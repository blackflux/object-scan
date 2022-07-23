import extractExamples from './replace-examples/extract-examples.js';
import renderExamples from './replace-examples/render-examples.js';

export default async (lines_) => {
  const lines = [...lines_];
  const examples = extractExamples(lines);
  const renders = await renderExamples(examples);

  for (let idx = renders.length - 1; idx > -1; idx -= 1) {
    const [start, end, rendered] = renders[idx];
    lines.splice(start, end - start + 1, ...rendered);
  }

  return lines;
};
