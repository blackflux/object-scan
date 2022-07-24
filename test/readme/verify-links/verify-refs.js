import assert from 'assert';
import Slugger from 'github-slugger';

export default async (refs, content) => {
  const slugger = new Slugger();

  const headerSlugs = content
    .match(/(?<=##+ )[^\n]+/g)
    .map((e) => slugger.slug(e, false));

  for (let i = 0; i < refs.length; i += 1) {
    const ref = refs[i];
    if (/^#\d+-/.test(ref)) {
      // ensure this is (probably) a valid header slug
      assert(headerSlugs.includes(ref.slice(1)), ref);
    } else {
      // ensuring id is declared somewhere in document
      assert(content.includes(` id="${ref.slice(1)}"`), ref);
    }
  }
};
