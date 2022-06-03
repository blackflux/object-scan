import { describe } from 'node-tdd';
import { expect } from 'chai';
import objectScanOriginal from '../src/index.js';

const objectScan = (needles, opts) => objectScanOriginal(
  needles,
  Object.keys(opts || {}).length === 1 && opts.joined === false
    ? undefined
    : { joined: true, ...opts }
);

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

  it('Testing No Needles With Context', () => {
    const find = objectScan([]);
    const context = { meta: [] };
    expect(find(haystack, context)).to.equal(context);
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

  describe('Testing context', () => {
    it('Testing context passed through', () => {
      const find = objectScan(['**'], {
        joined: false,
        filterFn: ({ key, context }) => {
          if (key.length === 3 && key[2] === 'child') {
            context.push(key);
          }
        }
      });
      expect(find(haystack, [])).to.deep.equal([['grandparent1', 'parent', 'child']]);
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
    const execute = (input, needles, result, strict = true) => expect(
      objectScan(needles, { strict })(input)
    ).to.deep.equal(result);

    describe('Testing Basic Exclusion', () => {
      const fixture = { a: { b: 'c', d: 'e' }, f: ['g', 'h'] };

      it('Testing nested exclusion', () => {
        execute(fixture, ['a.{*,!b}'], ['a.d']);
      });

      it('Testing two level target exclusion', () => {
        execute(fixture, ['*.*,!a.b'], ['a.d']);
      });

      it('Testing array exclusion', () => {
        execute(fixture, ['*[*],!*[0]'], ['f[1]']);
      });

      it('Testing Include, exclude, include, exclude', () => {
        execute(fixture, ['**', '!{*.*,*,*[*]}', 'a.*', '!a.b'], ['a.d']);
      });

      it('Testing basic exclude, include', () => {
        execute(fixture, ['!a', 'a.b'], ['a.b']);
      });

      it('Testing star exclude, include', () => {
        execute(fixture, ['!**.d', '**'], ['f[1]', 'f[0]', 'f', 'a.d', 'a.b', 'a'], false);
      });

      it('Testing star include, exclude', () => {
        execute(fixture, ['**', '!a.*', '!f[*]'], ['f', 'a']);
      });
    });

    describe('Testing Redundant Needle Target Exclusion', () => {
      const fixture = { a: { b: { c: 'd' } } };

      it('Testing nested re-include', () => {
        execute(fixture, ['a.b.c', 'a.!b.*', 'a.b.**'], ['a.b.c', 'a.b'], false);
      });

      it('Testing nested re-exclude', () => {
        execute(fixture, ['!a.b.c', 'a.b.*', '!a.b.**'], [], false);
      });
    });

    describe('Testing Flat Exclusion', () => {
      const fixture = {
        a: { x: '' }, b: { x: '' }, c: { x: '' }, d: { x: '' }, e: { x: '' }
      };

      it('Exclusion after two inclusions', () => {
        execute(fixture, ['a.x', '*.x', '!{c,d,e}.x'], ['b.x', 'a.x']);
      });

      it('Inclusion after exclusion', () => {
        execute(fixture, ['!*.x', 'a.x'], ['a.x']);
      });

      it('Inclusion only', () => {
        execute(fixture, ['*.x'], ['e.x', 'd.x', 'c.x', 'b.x', 'a.x']);
      });

      it('Exclusions only', () => {
        execute(fixture, ['!a.x', '!b.x'], []);
      });
    });

    describe('Testing Cross Exclusion Merging', () => {
      const fixture = [{ a: 1 }];

      it('Exclusion basic one', () => {
        execute(fixture, ['[*]', '[0].a', '[0].!?', '[*].a'], ['[0].a', '[0]']);
      });

      it('Inclusion basic two', () => {
        execute(fixture, ['[0].a', '[*]', '[0].!?', '[*].a'], ['[0].a', '[0]']);
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
        execute(fixture1, ['foo'], ['foo']);
        execute(fixture1, ['!foo'], []);
        execute(fixture1, ['foo', 'bar'], ['bar', 'foo']);
      });

      it('Exclusion only, no results', () => {
        execute(fixture1, ['!foo', '!bar'], []);
        execute(fixture1, ['!*z'], []);
        execute(fixture1, ['!*z', '!*a*'], []);
        execute(fixture1, ['!*'], []);
      });

      it('Exclusions are order sensitive', () => {
        execute(fixture1, ['!*a*', '*z'], ['baz']);
        execute(fixture1, ['*z', '!*a*'], []);
        execute(fixture2, ['!*m', 'f*'], ['forum', 'for', 'foam', 'foo']);
        execute(fixture2, ['f*', '!*m'], ['for', 'foo']);
      });

      it('Include Excluded', () => {
        execute(fixture1, ['!*a*'], []);
        execute(fixture1, ['!foo', 'bar'], ['bar']);
        execute(fixture1, ['!*a*', 'bar'], ['bar']);
        execute(fixture1, ['!*a*', '*'], ['baz', 'bar', 'foo']);
      });

      it('Exclude Inclusion', () => {
        execute(fixture1, ['bar', '!*a*'], []);
        execute(fixture1, ['foo', '!bar'], ['foo']);
      });

      it('One-Star Exclusions', () => {
        execute(fixture1, ['*', '!foo'], ['baz', 'bar']);
        execute(fixture1, ['*', '!foo', 'bar'], ['baz', 'bar']);
        execute(fixture1, ['!foo', '*'], ['baz', 'bar', 'foo']);
        execute(fixture1, ['*', '!foo', '!bar'], ['baz']);
        execute(fixture3, ['*', '!o*', 'once'], ['once', 'do', 'four', 'two', 'foo']);
      });
    });
  });

  describe('Testing empty needle behaviour', () => {
    const needles = [''];
    const arrayInput = [{ id: 1 }, { id: 2 }];
    const objectInput = { id: {} };
    const filterFn = (ps = []) => ({ isMatch, parents, matchedBy }) => {
      expect(isMatch).to.equal(true);
      expect(parents).to.deep.equal(ps);
      expect(matchedBy).to.deep.equal(['']);
    };

    it('Testing array objects with useArraySelector === true', () => {
      const find = objectScan(needles, { useArraySelector: true, filterFn: filterFn() });
      expect(find(arrayInput)).to.deep.equal(['']);
    });

    it('Testing array objects with useArraySelector === false', () => {
      const find = objectScan(needles, { useArraySelector: false, filterFn: filterFn([[{ id: 1 }, { id: 2 }]]) });
      expect(find(arrayInput)).to.deep.equal(['[1]', '[0]']);
    });

    it('Testing array objects with useArraySelector === false (nested)', () => {
      const find = objectScan(needles, {
        useArraySelector: false,
        filterFn: filterFn([[{ id: 1 }, { id: 2 }], [[{ id: 1 }, { id: 2 }]]])
      });
      expect(find([arrayInput])).to.deep.equal(['[0][1]', '[0][0]']);
    });

    it('Testing object with useArraySelector === true', () => {
      const find = objectScan(needles, { useArraySelector: true, filterFn: filterFn() });
      expect(find(objectInput)).to.deep.equal(['']);
    });

    it('Testing object with useArraySelector === false', () => {
      const find = objectScan(needles, { useArraySelector: false, filterFn: filterFn() });
      expect(find(objectInput)).to.deep.equal(['']);
    });

    it('Testing empty needle only matchedBy on top level', () => {
      const find = objectScan(['', '**'], {
        useArraySelector: false,
        filterFn: ({ matchedBy }) => matchedBy.includes('')
      });
      expect(find(arrayInput)).to.deep.equal(['[1]', '[0]']);
    });

    it('Testing empty needle returned with breakFn (since top level)', () => {
      const find = objectScan([''], { breakFn: () => true });
      expect(find(arrayInput)).to.deep.equal(['']);
    });
  });

  it('Testing Empty Property', () => {
    const find = objectScan(['a.(^$).b']);
    expect(find({ a: { '': { b: 0 } } })).to.deep.equal(['a..b']);
  });

  it('Testing null value', () => {
    const find = objectScan(['**'], { filterFn: ({ value }) => value === null });
    expect(find({ key: null })).to.deep.equal(['key']);
  });

  it('Testing undefined value', () => {
    const find = objectScan(['**'], { filterFn: ({ value }) => value === undefined });
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
    const find = objectScan(['array*.**.*[1**]', 'array*.*[1*]']);
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

  it('Testing entries', () => {
    objectScan(['**'], {
      filterFn: ({ key, value, entry }) => {
        expect([key, value]).to.deep.equal(entry);
      }
    })(haystack);
  });

  describe('Testing sorting', () => {
    it('Testing array matches reversed', () => {
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
      filterFn: ({ key, value }) => {
        result[key] = value;
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
          filterFn: ({ parents, parent, getParent }) => {
            expect(parents).to.deep.equal([input.one[0], input.one, input]);
            expect(parent).to.deep.equal(input.one[0]);
            expect(getParent()).to.deep.equal(input.one[0]);
          }
        })(input);
        expect(result).to.deep.equal(['one[0].child']);
      });

      it('Testing object parents useArraySelector == false', () => {
        const result = objectScan(pattern, {
          filterFn: ({ parents }) => {
            expect(parents).to.deep.equal([input.one[0], input.one, input]);
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
          filterFn: ({ parents }) => {
            expect(parents).to.deep.equal([input.one, input]);
          }
        })(input);
        expect(result).to.deep.equal(['one.child']);
      });

      it('Testing array parents useArraySelector == false', () => {
        const result = objectScan(pattern, {
          filterFn: ({ parents }) => {
            expect(parents).to.deep.equal([input.one.child, input.one, input]);
          },
          useArraySelector: false
        })(input);
        expect(result).to.deep.equal(['one.child[2]', 'one.child[1]', 'one.child[0]']);
      });
    });
  });

  describe('Testing useArraySelector + breakFn', () => {
    const input = { child: [{ id: 1 }] };

    const execTest = (useArraySelector, breakFn) => {
      const result = [];
      const needles = useArraySelector ? ['child[0].id'] : ['child.id'];
      objectScan(needles, {
        breakFn: ({ key }) => {
          result.push(key);
          return breakFn(key);
        },
        useArraySelector
      })(input);
      return result;
    };

    it('Testing useArraySelector = false, breakFn (BREAKING)', () => {
      expect(execTest(false, (k) => k === 'child')).to.deep.equal(['', 'child']);
    });

    it('Testing useArraySelector = false, breakFn', () => {
      expect(execTest(false, () => false)).to.deep.equal(['', 'child', 'child[0]', 'child[0].id']);
    });

    it('Testing useArraySelector = true, breakFn (BREAKING)', () => {
      expect(execTest(true, (k) => k === 'child')).to.deep.equal(['', 'child']);
    });

    it('Testing useArraySelector = true, breakFn', () => {
      expect(execTest(true, () => false)).to.deep.equal(['', 'child', 'child[0]', 'child[0].id']);
    });

    it('Testing useArraySelector = false invokes breakFn but not filterFn', () => {
      const result = [];
      objectScan(['**'], {
        useArraySelector: false,
        filterFn: ({ key }) => result.push(['filterFn', key]),
        breakFn: ({ key }) => result.push(['breakFn', key])
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

  describe('Testing isCircular', () => {
    let input;
    before(() => {
      input = { a: { b: null } };
      input.a.b = input;
    });

    it('Testing traversedBy on filterFn', () => {
      const result = [];
      objectScan(['**', ''], {
        filterFn: ({ key, depth, isCircular }) => {
          result.push([key, depth, isCircular]);
        },
        breakFn: ({ key }) => key.length > 10
      })(input);
      expect(result).to.deep.equal([
        ['a.b.a.b.a.b', 6, true],
        ['a.b.a.b.a', 5, true],
        ['a.b.a.b', 4, true],
        ['a.b.a', 3, true],
        ['a.b', 2, true],
        ['a', 1, false],
        ['', 0, false]
      ]);
    });
  });

  describe('Testing Fn traversedBy', () => {
    const input = [{ parent: { child: 'value' } }];
    const pattern = ['[*].*.child', '[*].parent'];

    it('Testing traversedBy on filterFn', () => {
      const result = [];
      objectScan(pattern, {
        filterFn: ({ key, traversedBy }) => result.push(`${traversedBy} => ${key}`)
      })(input);
      expect(result).to.deep.equal([
        '[*].*.child => [0].parent.child',
        '[*].*.child,[*].parent => [0].parent'
      ]);
    });

    it('Testing traversedBy on breakFn', () => {
      const result = [];
      objectScan(pattern, {
        breakFn: ({ key, isMatch, traversedBy }) => result.push(`${traversedBy} => ${key} (${isMatch})`)
      })(input);
      expect(result).to.deep.equal([
        '[*].*.child,[*].parent =>  (false)',
        '[*].*.child,[*].parent => [0] (false)',
        '[*].*.child,[*].parent => [0].parent (true)',
        '[*].*.child => [0].parent.child (true)'
      ]);
    });
  });

  it('Testing result', () => {
    const input = { f: { b: { a: null, d: { c: {}, e: {} } }, g: { i: { h: {} } } } };
    const ctx = [];
    const r = objectScan(['**'], {
      rtn: 'count',
      filterFn: ({ property, result, context }) => {
        context.push([property, result]);
      }
    })(input, ctx);
    expect(r).to.equal(9);
    expect(ctx).to.deep.equal([
      ['h', 0],
      ['i', 1],
      ['g', 2],
      ['e', 3],
      ['c', 4],
      ['d', 5],
      ['a', 6],
      ['b', 7],
      ['f', 8]
    ]);
  });

  describe('Testing Fn needle', () => {
    const input = [{ parent: { child: 'value' } }];
    const pattern = ['[*].*.child', '[*].parent'];

    it('Testing matchedBy on filterFn', () => {
      const result = [];
      objectScan(pattern, { filterFn: ({ key, matchedBy }) => result.push(`${matchedBy} => ${key}`) })(input);
      expect(result).to.deep.equal([
        '[*].*.child => [0].parent.child',
        '[*].parent => [0].parent'
      ]);
    });

    it('Testing matchedBy on breakFn', () => {
      const result = [];
      objectScan(pattern, {
        breakFn: ({ key, matchedBy }) => result.push(`${matchedBy} => ${key}`)
      })(input);
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

    it('Testing Error With Array Selector', () => {
      expect(() => objectScan(['array3[*].item'], { useArraySelector: false }))
        .to.throw('Forbidden Array Selector: array3[*].item, char 6');
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
      filterFn: ({ value }) => typeof value === 'string' && value === 'a'
    });
    expect(find(haystack)).to.deep.equal([
      'array2.nested[0]',
      'array1[0]',
      'simple'
    ]);
  });

  it('Ensure array does not match object key', () => {
    expect(objectScan(['[1]'])({ 1: 'bar' })).to.deep.equal([]);
  });

  it('Testing Excluded Regex', () => {
    const find = objectScan(['*', '!(a)']);
    expect(find(haystack)).to.deep.equal(['simple']);
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
      expect(find({ 'a,b': 'c', 'c,d': 'e', 'f\\,g': 'h' })).to.deep.equal([
        'f\\\\\\,g',
        'c\\,d',
        'a\\,b'
      ]);
    });

    it('Testing Escaped Dot', () => {
      const find = objectScan(['{a\\.b,c\\.d,f\\\\\\.g}']);
      expect(find({ 'a.b': 'c', 'c.d': 'e', 'f\\.g': 'h' })).to.deep.equal([
        'f\\\\\\.g',
        'c\\.d',
        'a\\.b'
      ]);
    });

    it('Testing Output Escaped', () => {
      const find = objectScan(['*']);
      expect(find({ 'some.key': '' })).to.deep.equal([
        'some\\.key'
      ]);
    });

    it('Testing question mark matches special character', () => {
      const find = objectScan(['k?y']);
      expect(find({ 'k*y': '' })).to.deep.equal([
        'k\\*y'
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
      'a.b',
      'a'
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
    expect(objectScan(['**', '!a.*.**'])(input)).to.deep.equal(['a']);
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
    const obj = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
    expect(objectScan(['*'])(obj)).to.deep.equal(['k', 'a']);
    expect(objectScan(['a.*.{c,f}'])(obj)).to.deep.equal(['a.e.f', 'a.b.c']);
    expect(objectScan(['a.*.{c,f}'], { joined: false })(obj)).to.deep.equal([['a', 'e', 'f'], ['a', 'b', 'c']]);
    expect(objectScan(['a.*.f'])(obj)).to.deep.equal(['a.e.f']);
    expect(objectScan(['*.*.*'])(obj)).to.deep.equal(['a.e.f', 'a.b.c']);
    expect(objectScan(['**'])(obj)).to
      .deep.equal(['k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b.c', 'a.b', 'a']);
    expect(objectScan(['**.f'])(obj)).to.deep.equal(['a.e.f']);
    expect(objectScan(['a.*,!a.e'])(obj)).to.deep.equal(['a.h', 'a.b']);
    expect(objectScan(['**.(^[bc]$)'], { joined: true })(obj)).to.deep.equal(['a.b.c', 'a.b']);
    expect(objectScan(['**'], { filterFn: ({ value }) => typeof value === 'string' })(obj)).to
      .deep.equal(['k', 'a.h[1]', 'a.h[0]', 'a.e.f', 'a.b.c']);
    expect(objectScan(['**'], { breakFn: ({ key }) => key === 'a.b' })(obj)).to
      .deep.equal(['k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b', 'a']);
    expect(objectScan(['**[*]'])(obj)).to.deep.equal(['a.h[1]', 'a.h[0]']);
    expect(objectScan(['*.*[*]'])(obj)).to.deep.equal(['a.h[1]', 'a.h[0]']);
    expect(objectScan(['*[*]'])(obj)).to.deep.equal([]);
  });

  it('Testing traversal order', () => {
    const breakFn = ({ property, context }) => {
      context.breakFn.push(property);
    };
    const filterFn = ({ property, context }) => {
      context.filterFn.push(property);
    };
    const options = { breakFn, filterFn };
    const tree = { f: { b: { a: {}, d: { c: {}, e: {} } }, g: { i: { h: {} } } } };
    expect(objectScan(['**'], options)(tree, { filterFn: [], breakFn: [] }))
      .to.deep.equal({
        // Post-order reverse
        breakFn: [undefined, 'f', 'g', 'i', 'h', 'b', 'd', 'e', 'c', 'a'],
        // Pre-order reverse
        filterFn: ['h', 'i', 'g', 'e', 'c', 'd', 'a', 'b', 'f']
      });
    expect(objectScan(['**'], { ...options, reverse: false })(tree, { filterFn: [], breakFn: [] }))
      .to.deep.equal({
        // Pre-order
        breakFn: [undefined, 'f', 'b', 'a', 'd', 'c', 'e', 'g', 'i', 'h'],
        // Post-order
        filterFn: ['a', 'c', 'e', 'd', 'b', 'h', 'i', 'g', 'f']
      });
  });

  it('Testing traversal order sorted', () => {
    const breakFn = ({ property, context }) => {
      context.breakFn.push(property);
    };
    const filterFn = ({ property, context }) => {
      context.filterFn.push(property);
    };
    const compareFn = () => (a, b) => a.localeCompare(b);
    const options = { breakFn, filterFn, compareFn };
    const tree = { a: {}, c: {}, b: [{ d: {}, f: {}, e: {} }, { g: {}, h: {}, i: {} }] };
    expect(objectScan(['**'], options)(tree, { filterFn: [], breakFn: [] }))
      .to.deep.equal({
        breakFn: [undefined, 'c', 'b', 1, 'i', 'h', 'g', 0, 'f', 'e', 'd', 'a'],
        filterFn: ['c', 'i', 'h', 'g', 1, 'f', 'e', 'd', 0, 'b', 'a']
      });
    expect(objectScan(['**'], { ...options, reverse: false })(tree, { filterFn: [], breakFn: [] }))
      .to.deep.equal({
        breakFn: [undefined, 'a', 'b', 0, 'd', 'e', 'f', 1, 'g', 'h', 'i', 'c'],
        filterFn: ['a', 'd', 'e', 'f', 0, 'g', 'h', 'i', 1, 'b', 'c']
      });
  });

  // todo: lots and lots more tests !!!!
  describe('Testing star group matching', () => {
    const input = {};
    let t;
    before(() => {
      input.a = input;
      input.b = input;
      input.c = input;
      input.d = input;
      input.n = [input, input, input, input];
      input.nn = [];
      input.nn.push(input.nn, input.nn, input.nn, input.nn);
      t = (needle) => objectScan([needle], {
        breakFn: ({ depth }) => depth > 10
      })(input);
    });

    it('Testing basic nesting', () => {
      expect(t('**{a.b.c.d}')).to.deep.equal(['a.b.c.d.a.b.c.d', 'a.b.c.d']);
      expect(t('++{a.b.c.d}')).to.deep.equal(['a.b.c.d.a.b.c.d', 'a.b.c.d']);
    });

    it('Testing zero vs one nesting', () => {
      expect(t('a.**{a.b.c.d}.a')).to.deep.equal(['a.a.b.c.d.a.b.c.d.a', 'a.a.b.c.d.a', 'a.a']);
      expect(t('a.++{a.b.c.d}.a')).to.deep.equal(['a.a.b.c.d.a.b.c.d.a', 'a.a.b.c.d.a']);
    });

    it('Testing or group is mixed in matching', () => {
      expect(t('**{a.b.c.d,d.c.b.a}')).to.deep.equal([
        'd.c.b.a.d.c.b.a',
        'd.c.b.a.a.b.c.d',
        'd.c.b.a',
        'a.b.c.d.d.c.b.a',
        'a.b.c.d.a.b.c.d',
        'a.b.c.d'
      ]);
    });

    it('Testing single or group', () => {
      expect(t('**{a}')).to.deep.equal([
        'a.a.a.a.a.a.a.a.a.a.a',
        'a.a.a.a.a.a.a.a.a.a',
        'a.a.a.a.a.a.a.a.a',
        'a.a.a.a.a.a.a.a',
        'a.a.a.a.a.a.a',
        'a.a.a.a.a.a',
        'a.a.a.a.a',
        'a.a.a.a',
        'a.a.a',
        'a.a',
        'a'
      ]);
    });

    it('Testing single or group with prefix', () => {
      expect(t('b.**{a}')).to.deep.equal([
        'b.a.a.a.a.a.a.a.a.a.a',
        'b.a.a.a.a.a.a.a.a.a',
        'b.a.a.a.a.a.a.a.a',
        'b.a.a.a.a.a.a.a',
        'b.a.a.a.a.a.a',
        'b.a.a.a.a.a',
        'b.a.a.a.a',
        'b.a.a.a',
        'b.a.a',
        'b.a',
        'b'
      ]);
    });

    it('Testing single or group with postfix', () => {
      // todo: the order should be leaf to root (!!!)
      expect(t('**{a}.b')).to.deep.equal([
        'b',
        'a.b',
        'a.a.b',
        'a.a.a.b',
        'a.a.a.a.b',
        'a.a.a.a.a.b',
        'a.a.a.a.a.a.b',
        'a.a.a.a.a.a.a.b',
        'a.a.a.a.a.a.a.a.b',
        'a.a.a.a.a.a.a.a.a.b',
        'a.a.a.a.a.a.a.a.a.a.b'
      ]);
    });

    it('Testing redundant needle does not error', () => {
      expect(t('a.b.c.d.**{a.b.c.d,a.b.c}')).to.deep.equal([
        'a.b.c.d.a.b.c.d.a.b.c',
        'a.b.c.d.a.b.c.d',
        'a.b.c.d.a.b.c.a.b.c.d',
        'a.b.c.d.a.b.c.a.b.c',
        'a.b.c.d.a.b.c',
        'a.b.c.d'
      ]);
    });

    it('Testing long prefix and postfix with or group', () => {
      expect(t('a.b.**{a.b.c.d,d.c.b.a}.a.b')).to.deep.equal([
        'a.b.d.c.b.a.a.b',
        'a.b.a.b.c.d.a.b',
        'a.b.a.b'
      ]);
    });

    it('Testing long prefix with or group', () => {
      expect(t('a.b.**{a.b.c.d,d.c.b.a}')).to.deep.equal([
        'a.b.d.c.b.a.d.c.b.a',
        'a.b.d.c.b.a.a.b.c.d',
        'a.b.d.c.b.a',
        'a.b.a.b.c.d.d.c.b.a',
        'a.b.a.b.c.d.a.b.c.d',
        'a.b.a.b.c.d',
        'a.b'
      ]);
    });

    it('Testing long postfix with or group', () => {
      expect(t('**{a.b.c.d,d.c.b.a}.a.b')).to.deep.equal([
        'd.c.b.a.d.c.b.a.a.b',
        'd.c.b.a.a.b.c.d.a.b',
        'd.c.b.a.a.b',
        'a.b.c.d.d.c.b.a.a.b',
        'a.b.c.d.a.b.c.d.a.b',
        'a.b.c.d.a.b',
        'a.b'
      ]);
    });

    it('Testing complex nesting (top level simple)', () => {
      expect(t('a.b.c.d.**{a.++{b.c}.d,d.c}')).to.deep.equal([
        'a.b.c.d.d.c.d.c.d.c',
        'a.b.c.d.d.c.d.c',
        'a.b.c.d.d.c.a.b.c.d',
        'a.b.c.d.d.c',
        'a.b.c.d.a.b.c.d.d.c',
        'a.b.c.d.a.b.c.d',
        'a.b.c.d.a.b.c.b.c.d',
        'a.b.c.d'
      ]);
    });

    it('Testing double nested', () => {
      expect(t('**{++{a.b.c.d},n}')).to.deep.equal([
        'n',
        'a.b.c.d.n',
        'a.b.c.d.a.b.c.d.n',
        'a.b.c.d.a.b.c.d',
        'a.b.c.d'
      ]);
    });

    it('Testing complex nesting (top level)', () => {
      expect(t('**{a.b.c.++{b.c}.d,a.b.c.d}')).to.deep.equal([
        'a.b.c.d.a.b.c.d',
        'a.b.c.d.a.b.c.b.c.d',
        'a.b.c.d',
        'a.b.c.b.c.d.a.b.c.d',
        'a.b.c.b.c.d',
        'a.b.c.b.c.b.c.d',
        'a.b.c.b.c.b.c.b.c.d'
      ]);
    });

    it('Testing nested arrays with keys', () => {
      expect(t('**{n[{1,2}].n[0].n[*]}')).to.deep.equal([
        'n[2].n[0].n[3]',
        'n[2].n[0].n[2]',
        'n[2].n[0].n[1]',
        'n[2].n[0].n[0]',
        'n[1].n[0].n[3]',
        'n[1].n[0].n[2]',
        'n[1].n[0].n[1]',
        'n[1].n[0].n[0]'
      ]);
    });

    it('Testing nested arrays without keys', () => {
      expect(t('nn.**{[{1,2}][0][*]}[1][2][3][0][1][2][3]')).to.deep.equal([
        'nn[2][0][3][1][2][3][0][1][2][3]',
        'nn[2][0][2][1][2][3][0][1][2][3]',
        'nn[2][0][1][1][2][3][0][1][2][3]',
        'nn[2][0][0][1][2][3][0][1][2][3]',
        'nn[1][2][3][0][1][2][3]',
        'nn[1][0][3][1][2][3][0][1][2][3]',
        'nn[1][0][2][1][2][3][0][1][2][3]',
        'nn[1][0][1][1][2][3][0][1][2][3]',
        'nn[1][0][0][1][2][3][0][1][2][3]'
      ]);
    });

    it('Testing empty group throws error', () => {
      expect(() => t('**{}')).to.throw('Bad Group Terminator: **{}, char 3');
    });
  });
});
