const expect = require('chai').expect;
const objectScan = require('./../src/index');

const haystack = {
  simple: 'a',
  parent1: {
    child: 'b'
  },
  parent2: {
    child: 'c'
  },
  grandparent1: {
    parent: {
      child: 'd'
    }
  },
  array1: ['a', 'b', 'c'],
  array2: {
    nested: ['a', 'b', 'c']
  },
  array3: [{
    item: 'e'
  }, {
    item: 'f'
  }],
  array4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
};

describe('Testing Find', () => {
  it('Testing Top Level Exact', () => {
    const find = objectScan(['simple']);
    expect(find(haystack)).to.deep.equal([
      'simple'
    ]);
  });

  it('Testing Path Exact', () => {
    const find = objectScan(['parent1.child']);
    expect(find(haystack)).to.deep.equal([
      'parent1.child'
    ]);
  });

  it('Testing No Needles', () => {
    const find = objectScan([]);
    expect(find(haystack)).to.deep.equal([]);
  });

  it('Testing Key Wildcard', () => {
    const find = objectScan(['pa*nt*']);
    expect(find(haystack)).to.deep.equal([
      'parent2',
      'parent1'
    ]);
  });

  it('Testing Top Level Nested Array', () => {
    const find = objectScan(['**']);
    expect(find([[0, 1, 2, 3], [0, 1, 2, 3]])).to.deep.equal([
      '[1][3]',
      '[1][2]',
      '[1][1]',
      '[1][0]',
      '[1]',
      '[0][3]',
      '[0][2]',
      '[0][1]',
      '[0][0]',
      '[0]'
    ]);
  });

  it('Testing Arbitrary Location Nested Array', () => {
    const find = objectScan(['**.nestedArray[*][1]']);
    expect(find({
      key: {
        nestedArray: [['k1', 1], ['k2', 2], ['k3', 3], ['k4', 4]]
      }
    })).to.deep.equal([
      'key.nestedArray[3][1]',
      'key.nestedArray[2][1]',
      'key.nestedArray[1][1]',
      'key.nestedArray[0][1]'
    ]);
  });

  it('Testing Array Wildcard', () => {
    const find = objectScan(['**[1*]']);
    expect(find(haystack)).to.deep.equal([
      'array4[12]',
      'array4[11]',
      'array4[10]',
      'array4[1]',
      'array3[1]',
      'array2.nested[1]',
      'array1[1]'
    ]);
  });

  describe('Testing wildcard matching', () => {
    const fixture = {
      foo: { bar: '', mark: '' },
      sub: { baz: '', dow: '' },
      gaw: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
    };

    it('Testing Star Wildcard', () => {
      expect(objectScan(['f*oo'])(fixture)).to.deep.equal(['foo']);
      expect(objectScan(['f*o'])(fixture)).to.deep.equal(['foo']);
      expect(objectScan(['gaw[*2]'])(fixture)).to.deep.equal(['gaw[22]', 'gaw[12]', 'gaw[2]']);
      expect(objectScan(['gaw[*22]'])(fixture)).to.deep.equal(['gaw[22]']);
    });

    it('Testing Questionmark Wildcard', () => {
      expect(objectScan(['f?oo'])(fixture)).to.deep.equal([]);
      expect(objectScan(['f?o'])(fixture)).to.deep.equal(['foo']);
      expect(objectScan(['gaw[?2]'])(fixture)).to.deep.equal(['gaw[22]', 'gaw[12]']);
      expect(objectScan(['gaw[?22]'])(fixture)).to.deep.equal([]);
    });
  });

  describe('Testing greedy array matching', () => {
    const needles = ['*'];
    const input = { key: ['v1', 'v2'] };
    it('Testing arrays not matched with useArraySelector === true', () => {
      const find = objectScan(needles, { useArraySelector: true });
      expect(find(input)).to.deep.equal(['key']);
    });

    it('Testing arrays matched with useArraySelector === false', () => {
      const find = objectScan(needles, { useArraySelector: false });
      expect(find(input)).to.deep.equal(['key[1]', 'key[0]']);
    });
  });

  describe('Testing Exclusion', () => {
    const test = (input, needles, result) => expect(objectScan(needles)(input)).to.deep.equal(result);

    describe('Testing Basic Exclusion', () => {
      const fixture = { a: { b: 'c', d: 'e' }, f: ['g', 'h'] };

      it('Testing nested exclusion', () => {
        test(fixture, ['a.{*,!b}'], ['a.d']);
      });

      it('Testing two level target exclusion', () => {
        test(fixture, ['*.*,!a.b'], ['a.d']);
      });

      it('Testing array exclusion', () => {
        test(fixture, ['*[*],!*[0]'], ['f[1]']);
      });

      it('Testing Include, exclude, include, exclude', () => {
        test(fixture, ['**', '!{*.*,*,*[*]}', 'a.*', '!a.b'], ['a.d']);
      });

      it('Testing basic exclude, include', () => {
        test(fixture, ['!a', 'a.b'], ['a.b']);
      });

      it('Testing star exclude, include', () => {
        test(fixture, ['!**.d', '**'], ['f[1]', 'f[0]', 'f', 'a.d', 'a.b', 'a']);
      });

      it('Testing star include, exclude', () => {
        test(fixture, ['**', '!a.**', '!f.**'], ['f', 'a']);
      });
    });

    describe('Testing Redundant Needle Target Exclusion', () => {
      const fixture = { a: { b: { c: 'd' } } };

      it('Testing nested re-include', () => {
        test(fixture, ['a.b.c', 'a.!b.*', 'a.b.**'], ['a.b.c']);
      });

      it('Testing nested re-exclude', () => {
        test(fixture, ['!a.b.c', 'a.b.*', '!a.b.**'], []);
      });
    });

    describe('Testing Flat Exclusion', () => {
      const fixture = {
        a: { x: '' }, b: { x: '' }, c: { x: '' }, d: { x: '' }, e: { x: '' }
      };

      it('Exclusion after two inclusions', () => {
        test(fixture, ['a.x', '*.x', '!{c,d,e}.x'], ['b.x', 'a.x']);
      });

      it('Inclusion after exclusion', () => {
        test(fixture, ['!*.x', 'a.x'], ['a.x']);
      });

      it('Inclusion only', () => {
        test(fixture, ['*.x'], ['e.x', 'd.x', 'c.x', 'b.x', 'a.x']);
      });

      it('Exclusions only', () => {
        test(fixture, ['!a.x', '!b.x'], []);
      });
    });

    describe('Testing Misc Exclusions', () => {
      const fixture1 = { foo: '', bar: '', baz: '' };
      const fixture2 = {
        foo: '', foam: '', for: '', forum: ''
      };
      const fixture3 = {
        foo: '', one: '', two: '', four: '', do: '', once: '', only: ''
      };

      it('Basic exclusion', () => {
        test(fixture1, ['foo'], ['foo']);
        test(fixture1, ['!foo'], []);
        test(fixture1, ['foo', 'bar'], ['bar', 'foo']);
      });

      it('Exclusion only, no results', () => {
        test(fixture1, ['!foo', '!bar'], []);
        test(fixture1, ['!*z'], []);
        test(fixture1, ['!*z', '!*a*'], []);
        test(fixture1, ['!*'], []);
      });

      it('Exclusions are order sensitive', () => {
        test(fixture1, ['!*a*', '*z'], ['baz']);
        test(fixture1, ['*z', '!*a*'], []);
        test(fixture2, ['!*m', 'f*'], ['forum', 'for', 'foam', 'foo']);
        test(fixture2, ['f*', '!*m'], ['for', 'foo']);
      });

      it('Include Excluded', () => {
        test(fixture1, ['!*a*'], []);
        test(fixture1, ['!foo', 'bar'], ['bar']);
        test(fixture1, ['!*a*', 'bar'], ['bar']);
        test(fixture1, ['!*a*', '*'], ['baz', 'bar', 'foo']);
      });

      it('Exclude Inclusion', () => {
        test(fixture1, ['bar', '!*a*'], []);
        test(fixture1, ['foo', '!bar'], ['foo']);
      });

      it('One-Star Exclusions', () => {
        test(fixture1, ['*', '!foo'], ['baz', 'bar']);
        test(fixture1, ['*', '!foo', 'bar'], ['baz', 'bar']);
        test(fixture1, ['!foo', '*'], ['baz', 'bar', 'foo']);
        test(fixture1, ['*', '!foo', '!bar'], ['baz']);
        test(fixture3, ['*', '!o*', 'once'], ['once', 'do', 'four', 'two', 'foo']);
      });
    });
  });

  describe('Testing empty needle behaviour', () => {
    const needles = [''];
    const arrayInput = [{ id: 1 }, { id: 2 }];
    const objectInput = { id: {} };
    const filterFn = (key, value, { isMatch, matchedBy, parents }) => {
      expect(isMatch).to.equal(true);
      expect(parents).to.deep.equal([]);
      expect(matchedBy).to.deep.equal(['']);
    };

    it('Testing array objects with useArraySelector === true', () => {
      const find = objectScan(needles, { useArraySelector: true, filterFn });
      expect(find(arrayInput)).to.deep.equal(['']);
    });

    it('Testing array objects with useArraySelector === false', () => {
      const find = objectScan(needles, { useArraySelector: false, filterFn });
      expect(find(arrayInput)).to.deep.equal(['[1]', '[0]']);
    });

    it('Testing array objects with useArraySelector === false (nested)', () => {
      const find = objectScan(needles, { useArraySelector: false, filterFn });
      expect(find([arrayInput])).to.deep.equal(['[0][1]', '[0][0]']);
    });

    it('Testing object with useArraySelector === true', () => {
      const find = objectScan(needles, { useArraySelector: true, filterFn });
      expect(find(objectInput)).to.deep.equal(['']);
    });

    it('Testing object with useArraySelector === false', () => {
      const find = objectScan(needles, { useArraySelector: false, filterFn });
      expect(find(objectInput)).to.deep.equal(['']);
    });

    it('Testing empty needle only matchedBy on top level', () => {
      const find = objectScan(['', '**'], {
        useArraySelector: false,
        filterFn: (key, value, { matchedBy }) => matchedBy.includes('')
      });
      expect(find(arrayInput)).to.deep.equal(['[1]', '[0]']);
    });

    it('Testing empty needle returned with breakFn (since top level)', () => {
      const find = objectScan([''], { breakFn: () => true });
      expect(find(arrayInput)).to.deep.equal(['']);
    });
  });

  it('Testing null value', () => {
    const find = objectScan(['**'], { filterFn: (key, value) => value === null });
    expect(find({ key: null })).to.deep.equal(['key']);
  });

  it('Testing undefined value', () => {
    const find = objectScan(['**'], { filterFn: (key, value) => value === undefined });
    expect(find({ key: undefined })).to.deep.equal(['key']);
  });

  it('Testing Escaped Wildcard', () => {
    const input = {
      parent: null,
      'pa*nt*': null,
      'pa**nt**': null
    };
    expect(objectScan(['pa\\*nt\\*'])(input)).to.deep.equal(['pa\\*nt\\*']);
    expect(objectScan(['pa*nt*'])(input)).to.deep.equal(['pa\\*\\*nt\\*\\*', 'pa\\*nt\\*', 'parent']);
  });

  it('Testing Results Unique', () => {
    const find = objectScan(['array*.**[1*]', 'array*.*[1*]']);
    expect(find(haystack)).to.deep.equal([
      'array2.nested[1]'
    ]);
  });

  it('Testing Path Star', () => {
    const find = objectScan(['*.child']);
    expect(find(haystack)).to.deep.equal([
      'parent2.child',
      'parent1.child'
    ]);
  });

  it('Testing Path Multi Matching', () => {
    const find = objectScan(['*.child', '*.parent']);
    expect(find(haystack)).to.deep.equal([
      'grandparent1.parent',
      'parent2.child',
      'parent1.child'
    ]);
  });

  it('Testing Path Or Matching', () => {
    const find = objectScan(['*.{child,parent}']);
    expect(find(haystack)).to.deep.equal([
      'grandparent1.parent',
      'parent2.child',
      'parent1.child'
    ]);
  });

  it('Testing Path Double Star', () => {
    const find = objectScan(['**.child']);
    expect(find(haystack)).to.deep.equal([
      'grandparent1.parent.child',
      'parent2.child',
      'parent1.child'
    ]);
  });

  it('Testing Path Double Star (Separated)', () => {
    const find = objectScan(['**.child'], { joined: false });
    expect(find(haystack)).to.deep.equal([
      ['grandparent1', 'parent', 'child'],
      ['parent2', 'child'],
      ['parent1', 'child']
    ]);
  });

  describe('Testing sorting', () => {
    it('Testing array matches revered', () => {
      const find = objectScan(['**'], { joined: false });
      expect(find([1, 2, 3])).to.deep.equal([[2], [1], [0]]);
    });

    it('Testing inner matches before outer', () => {
      const find = objectScan(['**'], { joined: false });
      expect(find({ a: { b: 1 }, c: 2 })).to.deep.equal([['c'], ['a', 'b'], ['a']]);
    });
  });

  it('Testing filterFn', () => {
    const result = {};
    objectScan(['**.child'], {
      filterFn: (k, v) => {
        result[k] = v;
      }
    })(haystack);
    expect(result).to.deep.equal({
      'grandparent1.parent.child': 'd',
      'parent1.child': 'b',
      'parent2.child': 'c'
    });
  });

  describe('Testing Fn parents', () => {
    describe('Testing Object Target', () => {
      const input = { one: [{ child: 'b' }] };
      const pattern = ['**.child'];

      it('Testing object parents useArraySelector == true', () => {
        const result = objectScan(pattern, {
          filterFn: (k, v, { parents }) => {
            expect(parents).to.deep.equal([input.one[0], input.one, input]);
          }
        })(input);
        expect(result).to.deep.equal(['one[0].child']);
      });

      it('Testing object parents useArraySelector == false', () => {
        const result = objectScan(pattern, {
          filterFn: (k, v, { parents }) => {
            expect(parents).to.deep.equal([input.one[0], input]);
          },
          useArraySelector: false
        })(input);
        expect(result).to.deep.equal(['one[0].child']);
      });
    });

    describe('Testing Array Target', () => {
      const input = { one: { child: ['a', 'b', 'c'] } };
      const pattern = ['**.child'];

      it('Testing array parents useArraySelector == true', () => {
        const result = objectScan(pattern, {
          filterFn: (k, v, { parents }) => {
            expect(parents).to.deep.equal([input.one, input]);
          }
        })(input);
        expect(result).to.deep.equal(['one.child']);
      });

      it('Testing array parents useArraySelector == false', () => {
        const result = objectScan(pattern, {
          filterFn: (k, v, { parents }) => {
            expect(parents).to.deep.equal([input.one, input]);
          },
          useArraySelector: false
        })(input);
        expect(result).to.deep.equal(['one.child[2]', 'one.child[1]', 'one.child[0]']);
      });
    });
  });

  describe('Testing useArraySelector + breakFn', () => {
    const input = { child: [{ id: 1 }] };
    const pattern = ['child.id', 'child[0].id'];

    const execTest = (useArraySelector, breakFn) => {
      const result = [];
      objectScan(pattern, {
        breakFn: (k) => {
          result.push(k);
          return breakFn(k);
        },
        useArraySelector
      })(input);
      return result;
    };

    it('Testing useArraySelector = false, breakFn (BREAKING)', () => {
      expect(execTest(false, k => k === 'child')).to.deep.equal(['', 'child']);
    });

    it('Testing useArraySelector = false, breakFn', () => {
      expect(execTest(false, () => false)).to.deep.equal(['', 'child', 'child[0]', 'child[0].id']);
    });

    it('Testing useArraySelector = true, breakFn (BREAKING)', () => {
      expect(execTest(true, k => k === 'child')).to.deep.equal(['', 'child']);
    });

    it('Testing useArraySelector = true, breakFn', () => {
      expect(execTest(true, () => false)).to.deep.equal(['', 'child', 'child[0]', 'child[0].id']);
    });

    it('Testing useArraySelector = false invokes breakFn but not filterFn', () => {
      const result = [];
      objectScan(['**'], {
        useArraySelector: false,
        filterFn: k => result.push(['filterFn', k]),
        breakFn: k => result.push(['breakFn', k])
      })({
        tag: [[{ id: 1 }]]
      });
      expect(result).to.deep.equal([
        ['breakFn', ''],
        ['breakFn', 'tag'],
        ['breakFn', 'tag[0]'],
        ['breakFn', 'tag[0][0]'],
        ['breakFn', 'tag[0][0].id'],
        ['filterFn', 'tag[0][0].id'],
        ['filterFn', 'tag[0][0]']
      ]);
    });
  });

  describe('Testing Fn traversedBy', () => {
    const input = [{ parent: { child: 'value' } }];
    const pattern = ['[*].*.child', '[*].parent'];

    it('Testing traversedBy on filterFn', () => {
      const result = [];
      objectScan(pattern, { filterFn: (k, v, { traversedBy }) => result.push(`${traversedBy} => ${k}`) })(input);
      expect(result).to.deep.equal([
        '[*].*.child => [0].parent.child',
        '[*].*.child,[*].parent => [0].parent'
      ]);
    });

    it('Testing traversedBy on breakFn', () => {
      const result = [];
      objectScan(pattern, {
        breakFn: (k, v, { isMatch, traversedBy }) => result.push(`${traversedBy} => ${k} (${isMatch})`)
      })(input);
      expect(result).to.deep.equal([
        '[*].*.child,[*].parent =>  (false)',
        '[*].*.child,[*].parent => [0] (false)',
        '[*].*.child,[*].parent => [0].parent (true)',
        '[*].*.child => [0].parent.child (true)'
      ]);
    });
  });

  describe('Testing Fn needle', () => {
    const input = [{ parent: { child: 'value' } }];
    const pattern = ['[*].*.child', '[*].parent'];

    it('Testing matchedBy on filterFn', () => {
      const result = [];
      objectScan(pattern, { filterFn: (k, v, { matchedBy }) => result.push(`${matchedBy} => ${k}`) })(input);
      expect(result).to.deep.equal([
        '[*].*.child => [0].parent.child',
        '[*].parent => [0].parent'
      ]);
    });

    it('Testing matchedBy on breakFn', () => {
      const result = [];
      objectScan(pattern, { breakFn: (k, v, { matchedBy }) => result.push(`${matchedBy} => ${k}`) })(input);
      expect(result).to.deep.equal([
        ' => ',
        ' => [0]',
        '[*].parent => [0].parent',
        '[*].*.child => [0].parent.child'
      ]);
    });
  });

  describe('Testing useArraySelector === false', () => {
    it('Testing Nested Array Ordering', () => {
      const find = objectScan(['path', ''], { useArraySelector: false });
      expect(find([{ path: ['a', 'b'] }, { path: ['c', 'd'] }])).to.deep.equal([
        '[1].path[1]',
        '[1].path[0]',
        '[1]',
        '[0].path[1]',
        '[0].path[0]',
        '[0]'
      ]);
    });

    it('Testing Items Returned Without List Selector', () => {
      const find = objectScan(['array3.item'], { useArraySelector: false });
      expect(find(haystack)).to.deep.equal([
        'array3[1].item',
        'array3[0].item'
      ]);
    });

    it('Testing Items Not Returned With List Selector', () => {
      const find = objectScan(['array3[*].item'], { useArraySelector: false });
      expect(find(haystack)).to.deep.equal([]);
    });
  });

  it('Testing Array Top Level', () => {
    const find = objectScan(['[*]']);
    expect(find(haystack.array1)).to.deep.equal([
      '[2]',
      '[1]',
      '[0]'
    ]);
  });

  it('Testing Array Top Level Or', () => {
    const find = objectScan(['[{0,1}]']);
    expect(find(haystack.array1)).to.deep.equal([
      '[1]',
      '[0]'
    ]);
  });

  it('Testing Array Star', () => {
    const find = objectScan(['array1[*]']);
    expect(find(haystack)).to.deep.equal([
      'array1[2]',
      'array1[1]',
      'array1[0]'
    ]);
  });

  it('Testing Array Exact', () => {
    const find = objectScan(['array1[1]']);
    expect(find(haystack)).to.deep.equal([
      'array1[1]'
    ]);
  });

  it('Testing Array Nested Star', () => {
    const find = objectScan(['array2.nested[*]']);
    expect(find(haystack)).to.deep.equal([
      'array2.nested[2]',
      'array2.nested[1]',
      'array2.nested[0]'
    ]);
  });

  it('Testing Object Array', () => {
    const find = objectScan(['array3[*].item']);
    expect(find(haystack)).to.deep.equal([
      'array3[1].item',
      'array3[0].item'
    ]);
  });

  it('Testing Filter Function', () => {
    const find = objectScan(['**'], {
      filterFn: (key, value) => typeof value === 'string' && value === 'a'
    });
    expect(find(haystack)).to.deep.equal([
      'array2.nested[0]',
      'array1[0]',
      'simple'
    ]);
  });

  describe('Testing Escaping', () => {
    it('Testing Escaped Char Matching', () => {
      ['?', '!', ',', '.', '*', '[', ']', '{', '}'].forEach((char) => {
        const find = objectScan([`\\${char}`]);
        expect(find({ [char]: 'a', b: 'c' })).to.deep.equal([`\\${char}`]);
      });
    });

    it('Testing Escaped Star', () => {
      const find = objectScan(['a.\\[\\*\\]']);
      expect(find({ a: { '[*]': 'b', '[x]': 'c' } })).to.deep.equal([
        'a.\\[\\*\\]'
      ]);
    });

    it('Testing Escaped Comma', () => {
      const find = objectScan(['{a\\,b,c\\,d,f\\\\\\,g}']);
      expect(find({ 'a,b': 'c', 'c,d': 'e', 'f\\\\,g': 'h' })).to.deep.equal([
        'f\\\\\\,g',
        'c\\,d',
        'a\\,b'
      ]);
    });

    it('Testing Escaped Dot', () => {
      const find = objectScan(['{a\\.b,c\\.d,f\\\\\\.g}']);
      expect(find({ 'a.b': 'c', 'c.d': 'e', 'f\\\\.g': 'h' })).to.deep.equal([
        'f\\\\\\.g',
        'c\\.d',
        'a\\.b'
      ]);
    });

    it('Testing Output not Escaped', () => {
      const find = objectScan(['*'], { escapePaths: false });
      expect(find({ 'some.key': '' })).to.deep.equal([
        'some.key'
      ]);
    });
  });

  it('Testing Misc Tests', () => {
    const input = {
      a: {
        b: {
          c: 'd',
          e: 'f',
          g: 'h',
          i: { j: 'k' },
          l: { g: 'k' }
        },
        i: 'j'
      }
    };
    expect(objectScan(['a.**'])(input)).to.deep.equal([
      'a.i',
      'a.b.l.g',
      'a.b.l',
      'a.b.i.j',
      'a.b.i',
      'a.b.g',
      'a.b.e',
      'a.b.c',
      'a.b'
    ]);
    expect(objectScan(['a.*'])(input)).to.deep.equal(['a.i', 'a.b']);
    expect(objectScan(['a.b.c'])(input)).to.deep.equal(['a.b.c']);
    expect(objectScan(['**.{b,i}'])(input)).to.deep.equal(['a.i', 'a.b.i', 'a.b']);
    expect(objectScan(['*.{b,i}'])(input)).to.deep.equal(['a.i', 'a.b']);
    expect(objectScan(['a.*.{c,e}'])(input)).to.deep.equal(['a.b.e', 'a.b.c']);
    expect(objectScan(['a.*.g'])(input)).to.deep.equal(['a.b.g']);
    expect(objectScan(['a.**.g'])(input)).to.deep.equal(['a.b.l.g', 'a.b.g']);
    expect(objectScan(['*'])(input)).to.deep.equal(['a']);
    expect(objectScan(['a'])(input)).to.deep.equal(['a']);
    expect(objectScan(['c'])(input)).to.deep.equal([]);
    expect(objectScan(['**'])(input)).to.deep.equal([
      'a.i',
      'a.b.l.g',
      'a.b.l',
      'a.b.i.j',
      'a.b.i',
      'a.b.g',
      'a.b.e',
      'a.b.c',
      'a.b',
      'a'
    ]);
    expect(objectScan([])({ a: 'a', b: 'b', c: 'c' })).to.deep.equal([]);
    expect(objectScan(['b*'])({ foo: 'a', bar: 'b', baz: 'c' })).to.deep.equal(['baz', 'bar']);
    expect(objectScan(['b'])({ foo: 'a', bar: 'b', baz: 'c' })).to.deep.equal([]);
    expect(objectScan(['b', 'c'])({ a: 'a', b: 'b', c: 'c' })).to.deep.equal(['c', 'b']);
    expect(objectScan(['!a'])(input)).to.deep.equal([]);
    expect(objectScan(['!a', 'a.b.c'])(input)).to.deep.equal(['a.b.c']);
    expect(objectScan(['**', '!a.*'])(input)).to.deep.equal([
      'a.b.l.g',
      'a.b.l',
      'a.b.i.j',
      'a.b.i',
      'a.b.g',
      'a.b.e',
      'a.b.c',
      'a'
    ]);
    expect(objectScan(['**', '!a.**'])(input)).to.deep.equal(['a']);
    expect(objectScan(['a.b.*', '!a.b.{g,i,l}'])(input)).to.deep.equal(['a.b.e', 'a.b.c']);
    expect(objectScan(['**', '!a.b.c'])(input)).to.deep.equal([
      'a.i',
      'a.b.l.g',
      'a.b.l',
      'a.b.i.j',
      'a.b.i',
      'a.b.g',
      'a.b.e',
      'a.b',
      'a'
    ]);
  });

  it('Testing Readme Example', () => {
    const input = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
    expect(objectScan(['*'])(input)).to.deep.equal(['k', 'a']);
    expect(objectScan(['a.*.{c,f}'])(input)).to.deep.equal(['a.e.f', 'a.b.c']);
    expect(objectScan(['a.*.{c,f}'], { joined: false })(input)).to.deep.equal([['a', 'e', 'f'], ['a', 'b', 'c']]);
    expect(objectScan(['a.*.f'])(input)).to.deep.equal(['a.e.f']);
    expect(objectScan(['*.*.*'])(input)).to.deep.equal(['a.e.f', 'a.b.c']);
    expect(objectScan(['**'])(input)).to
      .deep.equal(['k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b.c', 'a.b', 'a']);
    expect(objectScan(['**.f'])(input)).to.deep.equal(['a.e.f']);
    expect(objectScan(['a.*,!a.e'])(input)).to.deep.equal(['a.h', 'a.b']);
    expect(objectScan(['**'], { filterFn: (key, value) => typeof value === 'string' })(input)).to
      .deep.equal(['k', 'a.h[1]', 'a.h[0]', 'a.e.f', 'a.b.c']);
    expect(objectScan(['**'], { breakFn: key => key === 'a.b' })(input)).to
      .deep.equal(['k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b', 'a']);
    expect(objectScan(['**[*]'])(input)).to.deep.equal(['a.h[1]', 'a.h[0]']);
    expect(objectScan(['*.*[*]'])(input)).to.deep.equal(['a.h[1]', 'a.h[0]']);
    expect(objectScan(['*[*]'])(input)).to.deep.equal([]);
  });
});
