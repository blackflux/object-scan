import verifyRefs from './verify-links/verify-refs.js';
import verifyUrls from './verify-links/verify-urls.js';
import verifyRels from './verify-links/verify-rels.js';

export default async (lines_) => {
  const content = lines_.join('\n');
  const links = [
    ...content
      .match(/]\([^)]+\)/gm)
      .map((e) => e.slice(2, -1)),
    ...content
      .match(/href="[^"]+"/gm)
      .map((e) => e.slice(6, -1))
  ];

  const urls = [];
  const refs = [];
  const rels = [];
  for (let i = 0; i < links.length; i += 1) {
    const link = links[i];
    if (link.startsWith('https://')) {
      urls.push(link);
    } else if (link.startsWith('#')) {
      refs.push(link);
    } else {
      rels.push(link);
    }
  }

  await Promise.all([
    verifyUrls(urls, content),
    verifyRefs(refs, content),
    verifyRels(rels, content)
  ]);

  return lines_;
};
