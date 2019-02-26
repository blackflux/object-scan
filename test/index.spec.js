const fs = require('fs');
const path = require('path');
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

  it('Testing Key Wildcard', () => {
    const find = objectScan(['pa*nt*']);
    expect(find(haystack)).to.deep.equal([
      'parent1',
      'parent2'
    ]);
  });

  it('Testing Top Level Nested Array', () => {
    const find = objectScan(['**']);
    expect(find([[0, 1, 2, 3], [0, 1, 2, 3]])).to.deep.equal([
      '[0]',
      '[0][0]',
      '[0][1]',
      '[0][2]',
      '[0][3]',
      '[1]',
      '[1][0]',
      '[1][1]',
      '[1][2]',
      '[1][3]'
    ]);
  });

  it('Testing Arbitrary Location Nested Array', () => {
    const find = objectScan(['**.nestedArray[*][1]']);
    expect(find({
      key: {
        nestedArray: [['k1', 1], ['k2', 2], ['k3', 3], ['k4', 4]]
      }
    })).to.deep.equal([
      'key.nestedArray[0][1]',
      'key.nestedArray[1][1]',
      'key.nestedArray[2][1]',
      'key.nestedArray[3][1]'
    ]);
  });

  it('Testing Array Wildcard', () => {
    const find = objectScan(['**[1*]']);
    expect(find(haystack)).to.deep.equal([
      'array1[1]',
      'array2.nested[1]',
      'array3[1]',
      'array4[1]',
      'array4[10]',
      'array4[11]',
      'array4[12]'
    ]);
  });

  it('Testing Large Json Files', () => {
    const maps = JSON.parse(fs.readFileSync(path.join(__dirname, 'resources', 'maps.json'), 'utf8'));
    const med = JSON.parse(fs.readFileSync(path.join(__dirname, 'resources', 'med.json'), 'utf8'));
    expect(objectScan(['**.lat'])(maps)).to.deep.equal([
      'results[0].geometry.location.lat',
      'results[0].geometry.viewport.northeast.lat',
      'results[0].geometry.viewport.southwest.lat'
    ]);
    expect(objectScan(['**[{1,2}]'])(maps)).to.deep.equal([
      'results[0].address_components[1]',
      'results[0].address_components[2]',
      'results[0].address_components[3].types[1]',
      'results[0].address_components[4].types[1]',
      'results[0].address_components[5].types[1]',
      'results[0].address_components[6].types[1]',
      'results[0].types[1]'
    ]);
    expect(objectScan(['**.*_*[{0,7}].*_name'])(maps)).to.deep.equal([
      'results[0].address_components[0].long_name',
      'results[0].address_components[0].short_name',
      'results[0].address_components[7].long_name',
      'results[0].address_components[7].short_name'
    ]);
    expect(objectScan(['**.name'])(med)).to.deep.equal([
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className[0].associatedDrug[0].name',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className[0].associatedDrug#2[0].name',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className2[0].associatedDrug[0].name',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className2[0].associatedDrug#2[0].name'
    ]);
    expect(objectScan(['**[0]'])(med)).to.deep.equal([
      'problems[0]',
      'problems[0].Diabetes[0]',
      'problems[0].Diabetes[0].medications[0]',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0]',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className[0]',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className[0].associatedDrug[0]',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className[0].associatedDrug#2[0]',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className2[0]',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className2[0].associatedDrug[0]',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className2[0].associatedDrug#2[0]',
      'problems[0].Diabetes[0].labs[0]',
      'problems[0].Asthma[0]'
    ]);
    expect(objectScan(['**.className*[*].associatedDrug*'])(med)).to.deep.equal([
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className[0].associatedDrug',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className[0].associatedDrug#2',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className2[0].associatedDrug',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className2[0].associatedDrug#2'
    ]);
    expect(objectScan(['**.*at*'])(med)).to.deep.equal([
      'problems[0].Diabetes[0].medications',
      'problems[0].Diabetes[0].medications[0].medicationsClasses',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className[0].associatedDrug',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className[0].associatedDrug#2',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className2[0].associatedDrug',
      'problems[0].Diabetes[0].medications[0].medicationsClasses[0].className2[0].associatedDrug#2'
    ]);
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
      expect(find(input)).to.deep.equal(['key[0]', 'key[1]']);
    });
  });

  describe('Testing empty needle behaviour', () => {
    const needles = [''];
    const arrayInput = [{ id: 1 }, { id: 2 }];
    const objectInput = { id: {} };
    const callbackFn = (key, value, { isMatch, matches, parents }) => {
      expect(isMatch).to.equal(true);
      expect(parents).to.deep.equal([]);
      expect(matches).to.deep.equal(['']);
    };

    it('Testing array objects with useArraySelector === true', () => {
      const find = objectScan(needles, { useArraySelector: true, callbackFn });
      expect(find(arrayInput)).to.deep.equal(['']);
    });

    it('Testing array objects with useArraySelector === false', () => {
      const find = objectScan(needles, { useArraySelector: false, callbackFn });
      expect(find(arrayInput)).to.deep.equal(['[0]', '[1]']);
    });

    it('Testing array objects with useArraySelector === false (nested)', () => {
      const find = objectScan(needles, { useArraySelector: false, callbackFn });
      expect(find([arrayInput])).to.deep.equal(['[0][0]', '[0][1]']);
    });

    it('Testing object with useArraySelector === true', () => {
      const find = objectScan(needles, { useArraySelector: true, callbackFn });
      expect(find(objectInput)).to.deep.equal(['']);
    });

    it('Testing object with useArraySelector === false', () => {
      const find = objectScan(needles, { useArraySelector: false, callbackFn });
      expect(find(objectInput)).to.deep.equal(['']);
    });

    it('Testing empty needle only matches on top level', () => {
      const find = objectScan(['', '**'], {
        useArraySelector: false,
        filterFn: (key, value, { matches }) => matches.includes('')
      });
      expect(find(arrayInput)).to.deep.equal(['[0]', '[1]']);
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
    expect(objectScan(['pa*nt*'])(input)).to.deep.equal(['parent', 'pa\\*nt\\*', 'pa\\*\\*nt\\*\\*']);
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
      'parent1.child',
      'parent2.child'
    ]);
  });

  it('Testing Path Multi Matching', () => {
    const find = objectScan(['*.child', '*.parent']);
    expect(find(haystack)).to.deep.equal([
      'parent1.child',
      'parent2.child',
      'grandparent1.parent'
    ]);
  });

  it('Testing Path Or Matching', () => {
    const find = objectScan(['*.{child,parent}']);
    expect(find(haystack)).to.deep.equal([
      'parent1.child',
      'parent2.child',
      'grandparent1.parent'
    ]);
  });

  it('Testing Path Double Star', () => {
    const find = objectScan(['**.child']);
    expect(find(haystack)).to.deep.equal([
      'parent1.child',
      'parent2.child',
      'grandparent1.parent.child'
    ]);
  });

  it('Testing Path Double Star (Separated)', () => {
    const find = objectScan(['**.child'], { joined: false });
    expect(find(haystack)).to.deep.equal([
      ['parent1', 'child'],
      ['parent2', 'child'],
      ['grandparent1', 'parent', 'child']
    ]);
  });

  describe('Testing sorting', () => {
    it('Testing number sort', () => {
      const find = objectScan(['**'], { joined: false, sorted: true });
      expect(find([1, 2, 3])).to.deep.equal([[2], [1], [0]]);
    });

    it('Testing string sort', () => {
      const find = objectScan(['**'], { joined: false, sorted: true });
      expect(find({ a: 1, b: 2, c: 3 })).to.deep.equal([['c'], ['b'], ['a']]);
    });

    it('Testing length sort', () => {
      const find = objectScan(['**'], { joined: false, sorted: true });
      expect(find({ a: { b: 1 }, c: 2 })).to.deep.equal([['a', 'b'], ['c'], ['a']]);
    });
  });

  it('Testing callbackFn', () => {
    const result = {};
    objectScan(['**.child'], {
      callbackFn: (k, v) => {
        result[k] = v;
      }
    })(haystack);
    expect(result).to.deep.equal({
      'grandparent1.parent.child': 'd',
      'parent1.child': 'b',
      'parent2.child': 'c'
    });
  });

  describe('Testing arrayCallbackFn', () => {
    const input = {
      array: [{ id: 1 }, { id: 2 }]
    };
    const tester = (useArraySelector, needles) => {
      const result = {
        default: [],
        array: []
      };
      objectScan(needles, {
        useArraySelector,
        callbackFn: (k, v) => {
          result.default.push(k);
        },
        arrayCallbackFn: (k, v) => {
          result.array.push(k);
        }
      })(input);
      return result;
    };

    it('Testing arrayCallbackFn with useArraySelector == true', () => {
      expect(tester(true, ['array'])).to.deep.equal({
        default: ['array'],
        array: []
      });
    });

    describe('Testing arrayCallbackFn with useArraySelector == false', () => {
      it('Test arrayCallbackFn, matched array', () => {
        expect(tester(false, ['array'])).to.deep.equal({
          default: ['array[0]', 'array[1]'],
          array: ['array']
        });
      });

      it('Test arrayCallbackFn, not matched array', () => {
        expect(tester(false, ['array.id'])).to.deep.equal({
          default: ['array[0].id', 'array[1].id'],
          array: []
        });
      });
    });
  });

  describe('Testing Fn parents', () => {
    describe('Testing Object Target', () => {
      const input = { one: [{ child: 'b' }] };
      const pattern = ['**.child'];

      it('Testing object parents useArraySelector == true', () => {
        const result = objectScan(pattern, {
          callbackFn: (k, v, { parents }) => {
            expect(parents).to.deep.equal([input.one[0], input.one, input]);
          }
        })(input);
        expect(result).to.deep.equal(['one[0].child']);
      });

      it('Testing object parents useArraySelector == false', () => {
        const result = objectScan(pattern, {
          callbackFn: (k, v, { parents }) => {
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
          callbackFn: (k, v, { parents }) => {
            expect(parents).to.deep.equal([input.one, input]);
          }
        })(input);
        expect(result).to.deep.equal(['one.child']);
      });

      it('Testing array parents useArraySelector == false', () => {
        const result = objectScan(pattern, {
          callbackFn: (k, v, { parents }) => {
            expect(parents).to.deep.equal([input.one, input]);
          },
          useArraySelector: false
        })(input);
        expect(result).to.deep.equal(['one.child[0]', 'one.child[1]', 'one.child[2]']);
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
  });

  describe('Testing Fn needles', () => {
    const input = [{ parent: { child: 'value' } }];
    const pattern = ['[*].*.child', '[*].parent'];

    it('Testing needles on callbackFn', () => {
      const result = [];
      objectScan(pattern, { callbackFn: (k, v, { needles }) => result.push(`${needles} => ${k}`) })(input);
      expect(result).to.deep.equal([
        '[*].*.child,[*].parent => [0].parent',
        '[*].*.child => [0].parent.child'
      ]);
    });

    it('Testing needles on breakFn', () => {
      const result = [];
      objectScan(pattern, {
        breakFn: (k, v, { isMatch, needles }) => result.push(`${needles} => ${k} (${isMatch})`)
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

    it('Testing needle on callbackFn', () => {
      const result = [];
      objectScan(pattern, { callbackFn: (k, v, { matches }) => result.push(`${matches} => ${k}`) })(input);
      expect(result).to.deep.equal([
        '[*].parent => [0].parent',
        '[*].*.child => [0].parent.child'
      ]);
    });

    it('Testing needle on breakFn', () => {
      const result = [];
      objectScan(pattern, { breakFn: (k, v, { matches }) => result.push(`${matches} => ${k}`) })(input);
      expect(result).to.deep.equal([
        ' => ',
        ' => [0]',
        '[*].parent => [0].parent',
        '[*].*.child => [0].parent.child'
      ]);
    });
  });

  describe('Testing useArraySelector === false', () => {
    it('Testing Items Returned Without List Selector', () => {
      const find = objectScan(['array3.item'], { useArraySelector: false });
      expect(find(haystack)).to.deep.equal([
        'array3[0].item',
        'array3[1].item'
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
      '[0]',
      '[1]',
      '[2]'
    ]);
  });

  it('Testing Array Top Level Or', () => {
    const find = objectScan(['[{0,1}]']);
    expect(find(haystack.array1)).to.deep.equal([
      '[0]',
      '[1]'
    ]);
  });

  it('Testing Array Star', () => {
    const find = objectScan(['array1[*]']);
    expect(find(haystack)).to.deep.equal([
      'array1[0]',
      'array1[1]',
      'array1[2]'
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
      'array2.nested[0]',
      'array2.nested[1]',
      'array2.nested[2]'
    ]);
  });

  it('Testing Object Array', () => {
    const find = objectScan(['array3[*].item']);
    expect(find(haystack)).to.deep.equal([
      'array3[0].item',
      'array3[1].item'
    ]);
  });

  it('Testing Filter Function', () => {
    const find = objectScan(['**'], {
      filterFn: (key, value) => typeof value === 'string' && value === 'a'
    });
    expect(find(haystack)).to.deep.equal([
      'simple',
      'array1[0]',
      'array2.nested[0]'
    ]);
  });

  describe('Testing Escaping', () => {
    it('Testing Escaped Char Matching', () => {
      [',', '.', '*', '[', ']', '{', '}'].forEach((char) => {
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
        'a\\,b',
        'c\\,d',
        'f\\\\\\,g'
      ]);
    });

    it('Testing Escaped Dot', () => {
      const find = objectScan(['{a\\.b,c\\.d,f\\\\\\.g}']);
      expect(find({ 'a.b': 'c', 'c.d': 'e', 'f\\\\.g': 'h' })).to.deep.equal([
        'a\\.b',
        'c\\.d',
        'f\\\\\\.g'
      ]);
    });

    it('Testing Output not Escaped', () => {
      const find = objectScan(['*'], { escapePaths: false });
      expect(find({ 'some.key': '' })).to.deep.equal([
        'some.key'
      ]);
    });
  });

  describe('Testing Multi Target Matching', () => {
    const executeTest = (ndls, input) => {
      const cbs = [];
      const matched = objectScan(ndls, {
        callbackFn: (key, value, {
          parents, isMatch, matches, needles
        }) => {
          cbs.push({
            key, value, parents, isMatch, matches, needles
          });
        }
      })(input);
      return { matched, cbs };
    };

    it('Testing Simple De-duplication', () => {
      expect(executeTest(
        ['a.b', '**'],
        { a: { b: 'c' } }
      )).to.deep.equal({
        matched: ['a', 'a.b'],
        cbs: [{
          key: 'a',
          value: { b: 'c' },
          parents: [{ a: { b: 'c' } }],
          isMatch: true,
          matches: ['**'],
          needles: ['a.b', '**']
        }, {
          key: 'a.b',
          value: 'c',
          parents: [{ b: 'c' }, { a: { b: 'c' } }],
          isMatch: true,
          matches: ['a.b', '**'],
          needles: ['a.b', '**']
        }]
      });
    });

    it('Testing Two Levels Deep', () => {
      expect(executeTest(
        ['a.b', '**.b', '*.b', '*a.b', 'a*.b', 'a', '**', '*', '*a', 'a*'],
        { a: { b: 'c' } }
      )).to.deep.equal({
        matched: ['a', 'a.b'],
        cbs: [{
          key: 'a',
          value: { b: 'c' },
          parents: [{ a: { b: 'c' } }],
          isMatch: true,
          matches: ['a', '**', '*', '*a', 'a*'],
          needles: ['a.b', 'a', '**.b', '**', '*.b', '*', '*a.b', '*a', 'a*.b', 'a*']
        }, {
          key: 'a.b',
          value: 'c',
          parents: [{ b: 'c' }, { a: { b: 'c' } }],
          isMatch: true,
          matches: ['a.b', '**', '**.b', '*.b', '*a.b', 'a*.b'],
          needles: ['a.b', '**.b', '**', '*.b', '*a.b', 'a*.b']
        }]
      });
    });

    it('Testing Tree Levels Deep', () => {
      expect(executeTest(
        ['a.b.c', 'a.*b.c', 'a.b*.c', 'a.*.c', 'a.**.c'],
        { a: { b: { c: 'd' } } }
      )).to.deep.equal({
        matched: ['a.b.c'],
        cbs: [{
          key: 'a.b.c',
          value: 'd',
          parents: [{ c: 'd' }, { b: { c: 'd' } }, { a: { b: { c: 'd' } } }],
          isMatch: true,
          matches: ['a.b.c', 'a.*b.c', 'a.b*.c', 'a.*.c', 'a.**.c'],
          needles: ['a.b.c', 'a.*b.c', 'a.b*.c', 'a.*.c', 'a.**.c']
        }]
      });
    });

    it('Testing Tree Levels Deep with Two Level Star Match', () => {
      expect(executeTest(
        ['a.b.c', 'a.*b.c', 'a.b*.c', 'a.*.c', 'a.**.c', 'a.**'],
        { a: { b: { c: 'd' } } }
      )).to.deep.equal({
        matched: ['a.b', 'a.b.c'],
        cbs: [{
          key: 'a.b',
          value: { c: 'd' },
          parents: [{ b: { c: 'd' } }, { a: { b: { c: 'd' } } }],
          isMatch: true,
          matches: ['a.**'],
          needles: ['a.b.c', 'a.*b.c', 'a.b*.c', 'a.*.c', 'a.**.c', 'a.**']
        }, {
          key: 'a.b.c',
          value: 'd',
          parents: [{ c: 'd' }, { b: { c: 'd' } }, { a: { b: { c: 'd' } } }],
          isMatch: true,
          matches: ['a.b.c', 'a.*b.c', 'a.b*.c', 'a.*.c', 'a.**', 'a.**.c'],
          needles: ['a.b.c', 'a.*b.c', 'a.b*.c', 'a.*.c', 'a.**.c', 'a.**']
        }]
      });
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
      'a.b',
      'a.b.c',
      'a.b.e',
      'a.b.g',
      'a.b.i',
      'a.b.i.j',
      'a.b.l',
      'a.b.l.g',
      'a.i'
    ]);
    expect(objectScan(['a.*'])(input)).to.deep.equal(['a.b', 'a.i']);
    expect(objectScan(['a.b.c'])(input)).to.deep.equal(['a.b.c']);
    expect(objectScan(['**.{b,i}'])(input)).to.deep.equal(['a.b', 'a.b.i', 'a.i']);
    expect(objectScan(['*.{b,i}'])(input)).to.deep.equal(['a.b', 'a.i']);
    expect(objectScan(['a.*.{c,e}'])(input)).to.deep.equal(['a.b.c', 'a.b.e']);
    expect(objectScan(['a.*.g'])(input)).to.deep.equal(['a.b.g']);
    expect(objectScan(['a.**.g'])(input)).to.deep.equal(['a.b.g', 'a.b.l.g']);
    expect(objectScan(['*'])(input)).to.deep.equal(['a']);
    expect(objectScan(['a'])(input)).to.deep.equal(['a']);
    expect(objectScan(['c'])(input)).to.deep.equal([]);
    expect(objectScan(['**'])(input)).to.deep.equal([
      'a',
      'a.b',
      'a.b.c',
      'a.b.e',
      'a.b.g',
      'a.b.i',
      'a.b.i.j',
      'a.b.l',
      'a.b.l.g',
      'a.i'
    ]);
    expect(objectScan([])({ a: 'a', b: 'b', c: 'c' })).to.deep.equal([]);
    expect(objectScan(['b*'])({ foo: 'a', bar: 'b', baz: 'c' })).to.deep.equal(['bar', 'baz']);
    expect(objectScan(['b'])({ foo: 'a', bar: 'b', baz: 'c' })).to.deep.equal([]);
    expect(objectScan(['b', 'c'])({ a: 'a', b: 'b', c: 'c' })).to.deep.equal(['b', 'c']);
  });

  it('Testing Readme Example', () => {
    const input = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
    expect(objectScan(['*'])(input)).to.deep.equal(['a', 'k']);
    expect(objectScan(['a.*.{c,f}'])(input)).to.deep.equal(['a.b.c', 'a.e.f']);
    expect(objectScan(['a.*.{c,f}'], { joined: false })(input)).to.deep.equal([['a', 'b', 'c'], ['a', 'e', 'f']]);
    expect(objectScan(['a.*.f'])(input)).to.deep.equal(['a.e.f']);
    expect(objectScan(['*.*.*'])(input)).to.deep.equal(['a.b.c', 'a.e.f']);
    expect(objectScan(['**'])(input)).to
      .deep.equal(['a', 'a.b', 'a.b.c', 'a.e', 'a.e.f', 'a.h', 'a.h[0]', 'a.h[1]', 'k']);
    expect(objectScan(['**.f'])(input)).to.deep.equal(['a.e.f']);
    expect(objectScan(['**'], { filterFn: (key, value) => typeof value === 'string' })(input)).to
      .deep.equal(['a.b.c', 'a.e.f', 'a.h[0]', 'a.h[1]', 'k']);
    expect(objectScan(['**'], { breakFn: key => key === 'a.b' })(input)).to
      .deep.equal(['a', 'a.b', 'a.e', 'a.e.f', 'a.h', 'a.h[0]', 'a.h[1]', 'k']);
    expect(objectScan(['**[*]'])(input)).to.deep.equal(['a.h[0]', 'a.h[1]']);
    expect(objectScan(['*.*[*]'])(input)).to.deep.equal(['a.h[0]', 'a.h[1]']);
    expect(objectScan(['*[*]'])(input)).to.deep.equal([]);
  });
});
