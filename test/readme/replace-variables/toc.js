import Slugger from 'github-slugger';

export default async (lines) => {
  const toc = [];

  // extract toc lines
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.startsWith('##')) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const [indent, number, ...title] = line.split(' ');
    const type = indent.length - 2;
    const ctx = { start: false, end: false };
    toc.push([type, number, title.join(' '), ctx]);
  }

  // determine nesting start and end
  for (let i = 0; i < toc.length; i += 1) {
    const cur = toc[i][0];
    const next = toc[i + 1]?.[0] || 0;
    toc[i][3].start = cur === 0 && next === 1;
    toc[i][3].end = cur === 1 && next === 0;
  }

  // rewrite toc lines to be more appealing
  const slugger = new Slugger();
  for (let i = 0; i < toc.length;) {
    const [type, number, title, ctx] = toc[i];
    const color = ['#1179b0', '#c96c01'][type].slice(1);
    const style = ['for-the-badge', 'flat-square'][type];
    const space = ' ';
    const indent = space.repeat(type);

    const slug = slugger.slug(`${number} ${title}`, false);
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

  return toc;
};
