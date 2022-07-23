import Slugger from 'github-slugger';

// todo: refactor file
export default (lines_) => {
  const lines = [...lines_];
  const stack = [];
  const toc = [];
  let tocIndex = -1;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    // eslint-disable-next-line no-template-curly-in-string
    if (line === '${{TOC}}') {
      tocIndex = i;
    }
    if (!/^#+ /.test(line)) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const indexOfFirstSpace = line.indexOf(' ');
    const indent = line.substring(0, indexOfFirstSpace);
    const title = line.substring(indexOfFirstSpace + 1);
    const type = indent.length - 2;
    if (type < 0) {
      // eslint-disable-next-line no-continue
      continue;
    }
    stack.length = type + 1;
    if (!stack[type]) {
      stack[type] = 0;
    }
    stack[type] += 1;
    const number = `${stack.join('.')}.`;
    lines[i] = `${indent} ${number} ${title}`;
    const ctx = { start: false, end: false };
    toc.push([type, number, title, ctx]);
  }

  for (let i = 0; i < toc.length; i += 1) {
    const cur = toc[i][0];
    const next = toc[i + 1]?.[0] || 0;
    toc[i][3].start = cur === 0 && next === 1;
    toc[i][3].end = cur === 1 && next === 0;
  }

  const slugger = new Slugger();
  for (let i = 0; i < toc.length;) {
    const [type, number, title, ctx] = toc[i];
    const color = ['#1179b0', '#c96c01'][type].slice(1);
    const style = ['for-the-badge', 'flat-square'][type];
    const space = ' ';
    const indent = space.repeat(type);

    const slug = slugger.slug(`${number} ${title}`);
    const result = [];
    const img = `https://shields.io/badge/${number}-${title.replace(/ /g, '%20')}-${color}?style=${style}`;
    const text = `<a href="#${slug}"><img alt="${title}" src="${img}"></a>`;
    if (ctx.start) {
      result.push(`<details><summary>${text}</summary>`);
    } else if (ctx.end) {
      result.push(`${indent}${space}${space}${text}</details>`);
    } else {
      result.push(`${indent}${space}${space}${text}<br>`);
    }
    toc.splice(i, 1, ...result);
    i += result.length;
  }

  lines.splice(tocIndex, 1, ...toc);

  return lines;
};
