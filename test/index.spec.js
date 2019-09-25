"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
// @ts-ignore
const node_tdd_1 = require("node-tdd");
const index_1 = __importDefault(require("../src/index"));
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
node_tdd_1.describe('Testing Find', () => {
    it('Testing Top Level Exact', () => {
        const find = index_1.default(['simple']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'simple'
        ]);
    });
    it('Testing Path Exact', () => {
        const find = index_1.default(['parent1.child']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'parent1.child'
        ]);
    });
    it('Testing No Needles', () => {
        const find = index_1.default([]);
        chai_1.expect(find(haystack)).to.deep.equal([]);
    });
    it('Testing Key Wildcard', () => {
        const find = index_1.default(['pa*nt*']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'parent2',
            'parent1'
        ]);
    });
    it('Testing Top Level Nested Array', () => {
        const find = index_1.default(['**']);
        chai_1.expect(find([[0, 1, 2, 3], [0, 1, 2, 3]])).to.deep.equal([
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
        const find = index_1.default(['**.nestedArray[*][1]']);
        chai_1.expect(find({
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
        const find = index_1.default(['**[1*]']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'array4[12]',
            'array4[11]',
            'array4[10]',
            'array4[1]',
            'array3[1]',
            'array2.nested[1]',
            'array1[1]'
        ]);
    });
    node_tdd_1.describe('Testing wildcard matching', () => {
        const fixture = {
            foo: { bar: '', mark: '' },
            sub: { baz: '', dow: '' },
            gaw: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
        };
        it('Testing Star Wildcard', () => {
            chai_1.expect(index_1.default(['f*oo'])(fixture)).to.deep.equal(['foo']);
            chai_1.expect(index_1.default(['f*o'])(fixture)).to.deep.equal(['foo']);
            chai_1.expect(index_1.default(['gaw[*2]'])(fixture)).to.deep.equal(['gaw[22]', 'gaw[12]', 'gaw[2]']);
            chai_1.expect(index_1.default(['gaw[*22]'])(fixture)).to.deep.equal(['gaw[22]']);
        });
        it('Testing Questionmark Wildcard', () => {
            chai_1.expect(index_1.default(['f?oo'])(fixture)).to.deep.equal([]);
            chai_1.expect(index_1.default(['f?o'])(fixture)).to.deep.equal(['foo']);
            chai_1.expect(index_1.default(['gaw[?2]'])(fixture)).to.deep.equal(['gaw[22]', 'gaw[12]']);
            chai_1.expect(index_1.default(['gaw[?22]'])(fixture)).to.deep.equal([]);
        });
    });
    node_tdd_1.describe('Testing greedy array matching', () => {
        const needles = ['*'];
        const input = { key: ['v1', 'v2'] };
        it('Testing arrays not matched with useArraySelector === true', () => {
            const find = index_1.default(needles, { useArraySelector: true });
            chai_1.expect(find(input)).to.deep.equal(['key']);
        });
        it('Testing arrays matched with useArraySelector === false', () => {
            const find = index_1.default(needles, { useArraySelector: false });
            chai_1.expect(find(input)).to.deep.equal(['key[1]', 'key[0]']);
        });
    });
    node_tdd_1.describe('Testing Exclusion', () => {
        const execute = (input, needles, result) => chai_1.expect(index_1.default(needles)(input)).to.deep.equal(result);
        node_tdd_1.describe('Testing Basic Exclusion', () => {
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
                execute(fixture, ['!**.d', '**'], ['f[1]', 'f[0]', 'f', 'a.d', 'a.b', 'a']);
            });
            it('Testing star include, exclude', () => {
                execute(fixture, ['**', '!a.*', '!f[*]'], ['f', 'a']);
            });
        });
        node_tdd_1.describe('Testing Redundant Needle Target Exclusion', () => {
            const fixture = { a: { b: { c: 'd' } } };
            it('Testing nested re-include', () => {
                execute(fixture, ['a.b.c', 'a.!b.*', 'a.b.**'], ['a.b.c', 'a.b']);
            });
            it('Testing nested re-exclude', () => {
                execute(fixture, ['!a.b.c', 'a.b.*', '!a.b.**'], []);
            });
        });
        node_tdd_1.describe('Testing Flat Exclusion', () => {
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
        node_tdd_1.describe('Testing Misc Exclusions', () => {
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
    node_tdd_1.describe('Testing empty needle behaviour', () => {
        const needles = [''];
        const arrayInput = [{ id: 1 }, { id: 2 }];
        const objectInput = { id: {} };
        const filterFn = (ps = []) => (key, value, { isMatch, matchedBy, parents }) => {
            chai_1.expect(isMatch).to.equal(true);
            chai_1.expect(parents).to.deep.equal(ps);
            chai_1.expect(matchedBy).to.deep.equal(['']);
        };
        it('Testing array objects with useArraySelector === true', () => {
            const find = index_1.default(needles, { useArraySelector: true, filterFn: filterFn() });
            chai_1.expect(find(arrayInput)).to.deep.equal(['']);
        });
        it('Testing array objects with useArraySelector === false', () => {
            const find = index_1.default(needles, { useArraySelector: false, filterFn: filterFn([[{ id: 1 }, { id: 2 }]]) });
            chai_1.expect(find(arrayInput)).to.deep.equal(['[1]', '[0]']);
        });
        it('Testing array objects with useArraySelector === false (nested)', () => {
            const find = index_1.default(needles, {
                useArraySelector: false,
                filterFn: filterFn([[{ id: 1 }, { id: 2 }], [[{ id: 1 }, { id: 2 }]]])
            });
            chai_1.expect(find([arrayInput])).to.deep.equal(['[0][1]', '[0][0]']);
        });
        it('Testing object with useArraySelector === true', () => {
            const find = index_1.default(needles, { useArraySelector: true, filterFn: filterFn() });
            chai_1.expect(find(objectInput)).to.deep.equal(['']);
        });
        it('Testing object with useArraySelector === false', () => {
            const find = index_1.default(needles, { useArraySelector: false, filterFn: filterFn() });
            chai_1.expect(find(objectInput)).to.deep.equal(['']);
        });
        it('Testing empty needle only matchedBy on top level', () => {
            const find = index_1.default(['', '**'], {
                useArraySelector: false,
                filterFn: (key, value, { matchedBy }) => matchedBy.includes('')
            });
            chai_1.expect(find(arrayInput)).to.deep.equal(['[1]', '[0]']);
        });
        it('Testing empty needle returned with breakFn (since top level)', () => {
            const find = index_1.default([''], { breakFn: () => true });
            chai_1.expect(find(arrayInput)).to.deep.equal(['']);
        });
    });
    it('Testing null value', () => {
        const find = index_1.default(['**'], { filterFn: (key, value) => value === null });
        chai_1.expect(find({ key: null })).to.deep.equal(['key']);
    });
    it('Testing undefined value', () => {
        const find = index_1.default(['**'], { filterFn: (key, value) => value === undefined });
        chai_1.expect(find({ key: undefined })).to.deep.equal(['key']);
    });
    it('Testing Escaped Wildcard', () => {
        const input = {
            parent: null,
            'pa*nt*': null,
            'pa**nt**': null
        };
        chai_1.expect(index_1.default(['pa\\*nt\\*'])(input)).to.deep.equal(['pa\\*nt\\*']);
        chai_1.expect(index_1.default(['pa*nt*'])(input)).to.deep.equal(['pa\\*\\*nt\\*\\*', 'pa\\*nt\\*', 'parent']);
    });
    it('Testing Results Unique', () => {
        const find = index_1.default(['array*.**.*[1**]', 'array*.*[1*]']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'array2.nested[1]'
        ]);
    });
    it('Testing Path Star', () => {
        const find = index_1.default(['*.child']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'parent2.child',
            'parent1.child'
        ]);
    });
    it('Testing Path Multi Matching', () => {
        const find = index_1.default(['*.child', '*.parent']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'grandparent1.parent',
            'parent2.child',
            'parent1.child'
        ]);
    });
    it('Testing Path Or Matching', () => {
        const find = index_1.default(['*.{child,parent}']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'grandparent1.parent',
            'parent2.child',
            'parent1.child'
        ]);
    });
    it('Testing Path Double Star', () => {
        const find = index_1.default(['**.child']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'grandparent1.parent.child',
            'parent2.child',
            'parent1.child'
        ]);
    });
    it('Testing Path Double Star (Separated)', () => {
        const find = index_1.default(['**.child'], { joined: false });
        chai_1.expect(find(haystack)).to.deep.equal([
            ['grandparent1', 'parent', 'child'],
            ['parent2', 'child'],
            ['parent1', 'child']
        ]);
    });
    node_tdd_1.describe('Testing sorting', () => {
        it('Testing array matches reversed', () => {
            const find = index_1.default(['**'], { joined: false });
            chai_1.expect(find([1, 2, 3])).to.deep.equal([[2], [1], [0]]);
        });
        it('Testing inner matches before outer', () => {
            const find = index_1.default(['**'], { joined: false });
            chai_1.expect(find({ a: { b: 1 }, c: 2 })).to.deep.equal([['c'], ['a', 'b'], ['a']]);
        });
    });
    it('Testing filterFn', () => {
        const result = {};
        index_1.default(['**.child'], {
            filterFn: (k, v) => {
                result[k] = v;
            }
        })(haystack);
        chai_1.expect(result).to.deep.equal({
            'grandparent1.parent.child': 'd',
            'parent1.child': 'b',
            'parent2.child': 'c'
        });
    });
    node_tdd_1.describe('Testing Fn parents', () => {
        node_tdd_1.describe('Testing Object Target', () => {
            const input = { one: [{ child: 'b' }] };
            const pattern = ['**.child'];
            it('Testing object parents useArraySelector == true', () => {
                const result = index_1.default(pattern, {
                    filterFn: (k, v, { parents }) => {
                        chai_1.expect(parents).to.deep.equal([input.one[0], input.one, input]);
                    }
                })(input);
                chai_1.expect(result).to.deep.equal(['one[0].child']);
            });
            it('Testing object parents useArraySelector == false', () => {
                const result = index_1.default(pattern, {
                    filterFn: (k, v, { parents }) => {
                        chai_1.expect(parents).to.deep.equal([input.one[0], input.one, input]);
                    },
                    useArraySelector: false
                })(input);
                chai_1.expect(result).to.deep.equal(['one[0].child']);
            });
        });
        node_tdd_1.describe('Testing Array Target', () => {
            const input = { one: { child: ['a', 'b', 'c'] } };
            const pattern = ['**.child'];
            it('Testing array parents useArraySelector == true', () => {
                const result = index_1.default(pattern, {
                    filterFn: (k, v, { parents }) => {
                        chai_1.expect(parents).to.deep.equal([input.one, input]);
                    }
                })(input);
                chai_1.expect(result).to.deep.equal(['one.child']);
            });
            it('Testing array parents useArraySelector == false', () => {
                const result = index_1.default(pattern, {
                    filterFn: (k, v, { parents }) => {
                        chai_1.expect(parents).to.deep.equal([input.one.child, input.one, input]);
                    },
                    useArraySelector: false
                })(input);
                chai_1.expect(result).to.deep.equal(['one.child[2]', 'one.child[1]', 'one.child[0]']);
            });
        });
    });
    node_tdd_1.describe('Testing useArraySelector + breakFn', () => {
        const input = { child: [{ id: 1 }] };
        const pattern = ['child.id', 'child[0].id'];
        const execTest = (useArraySelector, breakFn) => {
            const result = [];
            index_1.default(pattern, {
                breakFn: (k) => {
                    result.push(k);
                    return breakFn(k);
                },
                useArraySelector
            })(input);
            return result;
        };
        it('Testing useArraySelector = false, breakFn (BREAKING)', () => {
            chai_1.expect(execTest(false, (k) => k === 'child')).to.deep.equal(['', 'child']);
        });
        it('Testing useArraySelector = false, breakFn', () => {
            chai_1.expect(execTest(false, () => false)).to.deep.equal(['', 'child', 'child[0]', 'child[0].id']);
        });
        it('Testing useArraySelector = true, breakFn (BREAKING)', () => {
            chai_1.expect(execTest(true, (k) => k === 'child')).to.deep.equal(['', 'child']);
        });
        it('Testing useArraySelector = true, breakFn', () => {
            chai_1.expect(execTest(true, () => false)).to.deep.equal(['', 'child', 'child[0]', 'child[0].id']);
        });
        it('Testing useArraySelector = false invokes breakFn but not filterFn', () => {
            const result = [];
            index_1.default(['**'], {
                useArraySelector: false,
                filterFn: (k) => result.push(['filterFn', k]),
                breakFn: (k) => result.push(['breakFn', k])
            })({
                tag: [[{ id: 1 }]]
            });
            chai_1.expect(result).to.deep.equal([
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
    node_tdd_1.describe('Testing Fn traversedBy', () => {
        const input = [{ parent: { child: 'value' } }];
        const pattern = ['[*].*.child', '[*].parent'];
        it('Testing traversedBy on filterFn', () => {
            const result = [];
            index_1.default(pattern, {
                filterFn: (k, v, { traversedBy }) => result.push(`${traversedBy} => ${k}`)
            })(input);
            chai_1.expect(result).to.deep.equal([
                '[*].*.child => [0].parent.child',
                '[*].*.child,[*].parent => [0].parent'
            ]);
        });
        it('Testing traversedBy on breakFn', () => {
            const result = [];
            index_1.default(pattern, {
                breakFn: (k, v, { isMatch, traversedBy }) => result.push(`${traversedBy} => ${k} (${isMatch})`)
            })(input);
            chai_1.expect(result).to.deep.equal([
                '[*].*.child,[*].parent =>  (false)',
                '[*].*.child,[*].parent => [0] (false)',
                '[*].*.child,[*].parent => [0].parent (true)',
                '[*].*.child => [0].parent.child (true)'
            ]);
        });
    });
    node_tdd_1.describe('Testing Fn needle', () => {
        const input = [{ parent: { child: 'value' } }];
        const pattern = ['[*].*.child', '[*].parent'];
        it('Testing matchedBy on filterFn', () => {
            const result = [];
            index_1.default(pattern, {
                filterFn: (k, v, { matchedBy }) => result.push(`${matchedBy} => ${k}`)
            })(input);
            chai_1.expect(result).to.deep.equal([
                '[*].*.child => [0].parent.child',
                '[*].parent => [0].parent'
            ]);
        });
        it('Testing matchedBy on breakFn', () => {
            const result = [];
            index_1.default(pattern, {
                breakFn: (k, v, { matchedBy }) => result.push(`${matchedBy} => ${k}`)
            })(input);
            chai_1.expect(result).to.deep.equal([
                ' => ',
                ' => [0]',
                '[*].parent => [0].parent',
                '[*].*.child => [0].parent.child'
            ]);
        });
    });
    node_tdd_1.describe('Testing useArraySelector === false', () => {
        it('Testing Nested Array Ordering', () => {
            const find = index_1.default(['path', ''], { useArraySelector: false });
            chai_1.expect(find([{ path: ['a', 'b'] }, { path: ['c', 'd'] }])).to.deep.equal([
                '[1].path[1]',
                '[1].path[0]',
                '[1]',
                '[0].path[1]',
                '[0].path[0]',
                '[0]'
            ]);
        });
        it('Testing Items Returned Without List Selector', () => {
            const find = index_1.default(['array3.item'], { useArraySelector: false });
            chai_1.expect(find(haystack)).to.deep.equal([
                'array3[1].item',
                'array3[0].item'
            ]);
        });
        it('Testing Items Not Returned With List Selector', () => {
            const find = index_1.default(['array3[*].item'], { useArraySelector: false });
            chai_1.expect(find(haystack)).to.deep.equal([]);
        });
    });
    it('Testing Array Top Level', () => {
        const find = index_1.default(['[*]']);
        chai_1.expect(find(haystack.array1)).to.deep.equal([
            '[2]',
            '[1]',
            '[0]'
        ]);
    });
    it('Testing Array Top Level Or', () => {
        const find = index_1.default(['[{0,1}]']);
        chai_1.expect(find(haystack.array1)).to.deep.equal([
            '[1]',
            '[0]'
        ]);
    });
    it('Testing Array Star', () => {
        const find = index_1.default(['array1[*]']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'array1[2]',
            'array1[1]',
            'array1[0]'
        ]);
    });
    it('Testing Array Exact', () => {
        const find = index_1.default(['array1[1]']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'array1[1]'
        ]);
    });
    it('Testing Array Nested Star', () => {
        const find = index_1.default(['array2.nested[*]']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'array2.nested[2]',
            'array2.nested[1]',
            'array2.nested[0]'
        ]);
    });
    it('Testing Object Array', () => {
        const find = index_1.default(['array3[*].item']);
        chai_1.expect(find(haystack)).to.deep.equal([
            'array3[1].item',
            'array3[0].item'
        ]);
    });
    it('Testing Filter Function', () => {
        const find = index_1.default(['**'], {
            filterFn: (key, value) => typeof value === 'string' && value === 'a'
        });
        chai_1.expect(find(haystack)).to.deep.equal([
            'array2.nested[0]',
            'array1[0]',
            'simple'
        ]);
    });
    node_tdd_1.describe('Testing Escaping', () => {
        it('Testing Escaped Char Matching', () => {
            ['?', '!', ',', '.', '*', '[', ']', '{', '}'].forEach((char) => {
                const find = index_1.default([`\\${char}`]);
                chai_1.expect(find({ [char]: 'a', b: 'c' })).to.deep.equal([`\\${char}`]);
            });
        });
        it('Testing Escaped Star', () => {
            const find = index_1.default(['a.\\[\\*\\]']);
            chai_1.expect(find({ a: { '[*]': 'b', '[x]': 'c' } })).to.deep.equal([
                'a.\\[\\*\\]'
            ]);
        });
        it('Testing Escaped Comma', () => {
            const find = index_1.default(['{a\\,b,c\\,d,f\\\\\\,g}']);
            chai_1.expect(find({ 'a,b': 'c', 'c,d': 'e', 'f\\\\,g': 'h' })).to.deep.equal([
                'f\\\\\\,g',
                'c\\,d',
                'a\\,b'
            ]);
        });
        it('Testing Escaped Dot', () => {
            const find = index_1.default(['{a\\.b,c\\.d,f\\\\\\.g}']);
            chai_1.expect(find({ 'a.b': 'c', 'c.d': 'e', 'f\\\\.g': 'h' })).to.deep.equal([
                'f\\\\\\.g',
                'c\\.d',
                'a\\.b'
            ]);
        });
        it('Testing Output Escaped', () => {
            const find = index_1.default(['*']);
            chai_1.expect(find({ 'some.key': '' })).to.deep.equal([
                'some\\.key'
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
        chai_1.expect(index_1.default(['a.**'])(input)).to.deep.equal([
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
        chai_1.expect(index_1.default(['a.*'])(input)).to.deep.equal(['a.i', 'a.b']);
        chai_1.expect(index_1.default(['a.b.c'])(input)).to.deep.equal(['a.b.c']);
        chai_1.expect(index_1.default(['**.{b,i}'])(input)).to.deep.equal(['a.i', 'a.b.i', 'a.b']);
        chai_1.expect(index_1.default(['*.{b,i}'])(input)).to.deep.equal(['a.i', 'a.b']);
        chai_1.expect(index_1.default(['a.*.{c,e}'])(input)).to.deep.equal(['a.b.e', 'a.b.c']);
        chai_1.expect(index_1.default(['a.*.g'])(input)).to.deep.equal(['a.b.g']);
        chai_1.expect(index_1.default(['a.**.g'])(input)).to.deep.equal(['a.b.l.g', 'a.b.g']);
        chai_1.expect(index_1.default(['*'])(input)).to.deep.equal(['a']);
        chai_1.expect(index_1.default(['a'])(input)).to.deep.equal(['a']);
        chai_1.expect(index_1.default(['c'])(input)).to.deep.equal([]);
        chai_1.expect(index_1.default(['**'])(input)).to.deep.equal([
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
        chai_1.expect(index_1.default([])({ a: 'a', b: 'b', c: 'c' })).to.deep.equal([]);
        chai_1.expect(index_1.default(['b*'])({ foo: 'a', bar: 'b', baz: 'c' })).to.deep.equal(['baz', 'bar']);
        chai_1.expect(index_1.default(['b'])({ foo: 'a', bar: 'b', baz: 'c' })).to.deep.equal([]);
        chai_1.expect(index_1.default(['b', 'c'])({ a: 'a', b: 'b', c: 'c' })).to.deep.equal(['c', 'b']);
        chai_1.expect(index_1.default(['!a'])(input)).to.deep.equal([]);
        chai_1.expect(index_1.default(['!a', 'a.b.c'])(input)).to.deep.equal(['a.b.c']);
        chai_1.expect(index_1.default(['**', '!a.*'])(input)).to.deep.equal([
            'a.b.l.g',
            'a.b.l',
            'a.b.i.j',
            'a.b.i',
            'a.b.g',
            'a.b.e',
            'a.b.c',
            'a'
        ]);
        chai_1.expect(index_1.default(['**', '!a.*.**'])(input)).to.deep.equal(['a']);
        chai_1.expect(index_1.default(['a.b.*', '!a.b.{g,i,l}'])(input)).to.deep.equal(['a.b.e', 'a.b.c']);
        chai_1.expect(index_1.default(['**', '!a.b.c'])(input)).to.deep.equal([
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
        chai_1.expect(index_1.default(['*'])(input)).to.deep.equal(['k', 'a']);
        chai_1.expect(index_1.default(['a.*.{c,f}'])(input)).to.deep.equal(['a.e.f', 'a.b.c']);
        chai_1.expect(index_1.default(['a.*.{c,f}'], { joined: false })(input)).to.deep.equal([['a', 'e', 'f'], ['a', 'b', 'c']]);
        chai_1.expect(index_1.default(['a.*.f'])(input)).to.deep.equal(['a.e.f']);
        chai_1.expect(index_1.default(['*.*.*'])(input)).to.deep.equal(['a.e.f', 'a.b.c']);
        chai_1.expect(index_1.default(['**'])(input)).to
            .deep.equal(['k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b.c', 'a.b', 'a']);
        chai_1.expect(index_1.default(['**.f'])(input)).to.deep.equal(['a.e.f']);
        chai_1.expect(index_1.default(['a.*,!a.e'])(input)).to.deep.equal(['a.h', 'a.b']);
        chai_1.expect(index_1.default(['**'], { filterFn: (key, value) => typeof value === 'string' })(input)).to
            .deep.equal(['k', 'a.h[1]', 'a.h[0]', 'a.e.f', 'a.b.c']);
        chai_1.expect(index_1.default(['**'], { breakFn: (key) => key === 'a.b' })(input)).to
            .deep.equal(['k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b', 'a']);
        chai_1.expect(index_1.default(['**[*]'])(input)).to.deep.equal(['a.h[1]', 'a.h[0]']);
        chai_1.expect(index_1.default(['*.*[*]'])(input)).to.deep.equal(['a.h[1]', 'a.h[0]']);
        chai_1.expect(index_1.default(['*[*]'])(input)).to.deep.equal([]);
    });
});
