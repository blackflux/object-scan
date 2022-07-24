import assert from 'assert';

export default async (refs, content) => {
  for (let i = 0; i < refs.length; i += 1) {
    const ref = refs[i];
    // check this is not a auto generated heading slug
    if (!/^#\d+-/.test(ref)) {
      // ensuring id is declared somewhere in document
      assert(content.includes(` id="${ref.slice(1)}"`), ref);
    }
  }
};
