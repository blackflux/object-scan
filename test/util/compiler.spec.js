"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
// @ts-ignore
const node_tdd_1 = require("node-tdd");
const compiler_1 = require("../../src/util/compiler");
node_tdd_1.describe('Testing compiler', () => {
    node_tdd_1.describe('Testing Redundant Needle Target Errors', () => {
        it('Testing redundant needle target', () => {
            chai_1.expect(() => compiler_1.compile(['{a,b}', 'a']))
                .to.throw('Redundant Needle Target: "{a,b}" vs "a"');
        });
        it('Testing redundant self target (starstar)', () => {
            chai_1.expect(() => compiler_1.compile(['**.**']))
                .to.throw('Redundant Needle Target: "**.**" vs "**.**"');
        });
        it('Mixed subsequent needle collision', () => {
            chai_1.expect(() => compiler_1.compile(['bar', '!foo', 'foo']))
                .to.throw('Redundant Needle Target: "!foo" vs "foo"');
            chai_1.expect(() => compiler_1.compile(['bar', 'foo', '!foo']))
                .to.throw('Redundant Needle Target: "foo" vs "!foo"');
        });
        it('Mixed spaced needle collision', () => {
            chai_1.expect(() => compiler_1.compile(['!foo', 'bar', 'foo']))
                .to.throw('Redundant Needle Target: "!foo" vs "foo"');
            chai_1.expect(() => compiler_1.compile(['foo', 'bar', '!foo']))
                .to.throw('Redundant Needle Target: "foo" vs "!foo"');
        });
        it('Inclusion, subsequent needle collision', () => {
            chai_1.expect(() => compiler_1.compile(['once', 'once', '!o*']))
                .to.throw('Redundant Needle Target: "once" vs "once"');
        });
        it('Inclusion, spaced needle collision', () => {
            chai_1.expect(() => compiler_1.compile(['once', '!o*', 'once']))
                .to.throw('Redundant Needle Target: "once" vs "once"');
        });
        it('Exclusion, subsequent needle collision', () => {
            chai_1.expect(() => compiler_1.compile(['!once', '!once', 'o*']))
                .to.throw('Redundant Needle Target: "!once" vs "!once"');
        });
        it('Exclusion, spaced needle collision', () => {
            chai_1.expect(() => compiler_1.compile(['!once', 'o*', '!once']))
                .to.throw('Redundant Needle Target: "!once" vs "!once"');
        });
        it('Nested Exclusion Target collision', () => {
            chai_1.expect(() => compiler_1.compile(['a.b.c', 'a.!b.*', 'a.b.*']))
                .to.throw('Redundant Needle Target: "a.!b.*" vs "a.b.*"');
        });
        it('Testing redundant exclusion', () => {
            chai_1.expect(() => compiler_1.compile(['!a.!b']))
                .to.throw('Redundant Exclusion: "!a.!b"');
            chai_1.expect(() => compiler_1.compile(['{!a}.{!b}']))
                .to.throw('Redundant Exclusion: "{!a}.{!b}"');
            chai_1.expect(() => compiler_1.compile(['{!a,c}.{!b,d}']))
                .to.throw('Redundant Exclusion: "{!a,c}.{!b,d}"');
            chai_1.expect(() => compiler_1.compile(['[{!0,1}][{!2,3}]']))
                .to.throw('Redundant Exclusion: "[{!0,1}][{!2,3}]"');
            chai_1.expect(() => compiler_1.compile(['!{[1][2],*,{a,b},{a.!b}}']))
                .to.throw('Redundant Exclusion: "!{[1][2],*,{a,b},{a.!b}}"');
        });
    });
    it('Testing recursion position', () => {
        const input = ['!**.a', '**'];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({ '**': { a: {} }, a: {} });
        chai_1.expect(compiler_1.isRecursive(tower)).to.equal(false);
        chai_1.expect(compiler_1.isRecursive(tower['**'])).to.equal(true);
        chai_1.expect(compiler_1.getRecursionPos(tower['**'])).to.equal(1);
        chai_1.expect(compiler_1.isRecursive(tower['**'].a)).to.equal(false);
        chai_1.expect(compiler_1.isRecursive(tower.a)).to.equal(false);
    });
    it('Testing recursion position for strict=false', () => {
        const input = ['**', '**.b', '!**'];
        const tower = compiler_1.compile(input, false);
        chai_1.expect(tower).to.deep.equal({ '**': { b: {} }, b: {} });
        chai_1.expect(compiler_1.isRecursive(tower)).to.equal(false);
        chai_1.expect(compiler_1.isRecursive(tower['**'])).to.equal(true);
        chai_1.expect(compiler_1.getRecursionPos(tower['**'])).to.equal(1);
        chai_1.expect(compiler_1.isRecursive(tower['**'].b)).to.equal(false);
        chai_1.expect(compiler_1.isRecursive(tower.b)).to.equal(false);
    });
    it('Testing similar paths', () => {
        const input = ['a.b.c.d.e', 'a.b.c.d.f'];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({ a: { b: { c: { d: { e: {}, f: {} } } } } });
    });
    node_tdd_1.describe('Testing path component exclusion', () => {
        it('Testing forward exclusion inheritance in component path', () => {
            const input = ['{!a}.{b}'];
            const tower = compiler_1.compile(input);
            chai_1.expect(tower).to.deep.equal({ a: { b: {} } });
            chai_1.expect(compiler_1.hasMatches(tower)).to.equal(false);
            chai_1.expect(compiler_1.hasMatches(tower.a)).to.equal(false);
            chai_1.expect(compiler_1.hasMatches(tower.a.b)).to.equal(false);
        });
        it('Testing no backward exclusion inheritance in component path', () => {
            const input = ['{a}.{!b}'];
            const tower = compiler_1.compile(input);
            chai_1.expect(tower).to.deep.equal({ a: { b: {} } });
            chai_1.expect(compiler_1.hasMatches(tower)).to.equal(false);
            chai_1.expect(compiler_1.hasMatches(tower.a)).to.equal(false);
            chai_1.expect(compiler_1.hasMatches(tower.a.b)).to.equal(false);
        });
    });
    it('Testing similar paths exclusion', () => {
        const input = ['a.b.c.d.e', '!a.b.c.d.f'];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({ a: { b: { c: { d: { e: {}, f: {} } } } } });
        chai_1.expect(compiler_1.hasMatches(tower)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.b)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.b.c)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.b.c.d)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.b.c.d.e)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.b.c.d.f)).to.equal(false);
    });
    it('Testing top level exclusion', () => {
        const input = ['!a'];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({ a: {} });
        chai_1.expect(compiler_1.hasMatches(tower)).to.equal(false);
        chai_1.expect(compiler_1.hasMatches(tower.a)).to.equal(false);
    });
    it('Testing Or Paths', () => {
        const input = ['{a,b.c}'];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({
            a: {},
            b: {
                c: {}
            }
        });
    });
    it('Testing Top Level Or', () => {
        const input = ['a,b'];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({
            a: {},
            b: {}
        });
    });
    it('Testing Nested Or', () => {
        const input = ['{a,{b,c}}'];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({
            a: {},
            b: {},
            c: {}
        });
    });
    it('Testing Nested Or in List', () => {
        const input = ['[{1,{0,2}}]'];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({
            '[0]': {},
            '[1]': {},
            '[2]': {}
        });
    });
    it('Testing Star Input', () => {
        const input = [
            'a.b',
            '**.b',
            '*.b',
            '*a.b',
            'a*.b',
            'a',
            '**',
            '*',
            '*a',
            'a*'
        ];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({
            a: { b: {} },
            '**': { b: {} },
            '*': { b: {} },
            '*a': { b: {} },
            'a*': { b: {} },
            b: {}
        });
    });
    it('Testing Star Input Array', () => {
        const input = [
            '[0][1]',
            '**[1]',
            '[*][1]',
            '[*0][1]',
            '[0*][1]',
            '[0]',
            '**',
            '[*]',
            '[*0]',
            '[0*]'
        ];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({
            '[0]': { '[1]': {} },
            '**': { '[1]': {} },
            '[*]': { '[1]': {} },
            '[*0]': { '[1]': {} },
            '[0*]': { '[1]': {} },
            '[1]': {}
        });
    });
    it('Testing Complex Path', () => {
        const input = ['a[1].{hello.you,there[1].*,{a.b}}[{1}],a[2],a[1].*'];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({
            a: {
                '[1]': {
                    '*': {},
                    hello: {
                        you: {
                            '[1]': {}
                        }
                    },
                    there: {
                        '[1]': {
                            '*': {
                                '[1]': {}
                            }
                        }
                    },
                    a: {
                        b: {
                            '[1]': {}
                        }
                    }
                },
                '[2]': {}
            }
        });
    });
    it('Testing traversing', () => {
        const input = ['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g'];
        const tower = compiler_1.compile(input);
        chai_1.expect(tower).to.deep.equal({
            a: {
                b: {
                    d: {
                        g: {}
                    }
                },
                c: {
                    d: {},
                    f: {}
                },
                e: {
                    f: {}
                }
            }
        });
        chai_1.expect(compiler_1.isLeaf(tower)).to.equal(false);
        chai_1.expect(compiler_1.isLeaf(tower.a)).to.equal(false);
        chai_1.expect(compiler_1.isLeaf(tower.a.b)).to.equal(false);
        chai_1.expect(compiler_1.isLeaf(tower.a.b.d)).to.equal(true);
        chai_1.expect(compiler_1.isLeaf(tower.a.b.d.g)).to.equal(true);
        chai_1.expect(compiler_1.isLeaf(tower.a.c)).to.equal(false);
        chai_1.expect(compiler_1.isLeaf(tower.a.c.d)).to.equal(true);
        chai_1.expect(compiler_1.isLeaf(tower.a.c.f)).to.equal(true);
        chai_1.expect(compiler_1.isLeaf(tower.a.e)).to.equal(false);
        chai_1.expect(compiler_1.isLeaf(tower.a.e.f)).to.equal(true);
        chai_1.expect(compiler_1.isMatch(tower)).to.equal(false);
        chai_1.expect(compiler_1.isMatch(tower.a)).to.equal(false);
        chai_1.expect(compiler_1.isMatch(tower.a.b)).to.equal(false);
        chai_1.expect(compiler_1.isMatch(tower.a.b.d)).to.equal(true);
        chai_1.expect(compiler_1.isMatch(tower.a.b.d.g)).to.equal(false);
        chai_1.expect(compiler_1.isMatch(tower.a.c)).to.equal(false);
        chai_1.expect(compiler_1.isMatch(tower.a.c.d)).to.equal(true);
        chai_1.expect(compiler_1.isMatch(tower.a.c.f)).to.equal(true);
        chai_1.expect(compiler_1.isMatch(tower.a.e)).to.equal(false);
        chai_1.expect(compiler_1.isMatch(tower.a.e.f)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.b)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.b.d)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.b.d.g)).to.equal(false);
        chai_1.expect(compiler_1.hasMatches(tower.a.c)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.c.d)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.c.f)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.e)).to.equal(true);
        chai_1.expect(compiler_1.hasMatches(tower.a.e.f)).to.equal(true);
        chai_1.expect(compiler_1.getNeedles(tower)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
        chai_1.expect(compiler_1.getNeedles(tower.a)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g']);
        chai_1.expect(compiler_1.getNeedles(tower.a.b)).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
        chai_1.expect(compiler_1.getNeedles(tower.a.b.d)).to.deep.equal(['a.{b,c}.d', '!a.b.d.g']);
        chai_1.expect(compiler_1.getNeedles(tower.a.b.d.g)).to.deep.equal(['!a.b.d.g']);
        chai_1.expect(compiler_1.getNeedles(tower.a.c)).to.deep.equal(['a.{b,c}.d', 'a.{c,e}.f']);
        chai_1.expect(compiler_1.getNeedles(tower.a.c.d)).to.deep.equal(['a.{b,c}.d']);
        chai_1.expect(compiler_1.getNeedles(tower.a.c.f)).to.deep.equal(['a.{c,e}.f']);
        chai_1.expect(compiler_1.getNeedles(tower.a.e)).to.deep.equal(['a.{c,e}.f']);
        chai_1.expect(compiler_1.getNeedles(tower.a.e.f)).to.deep.equal(['a.{c,e}.f']);
        chai_1.expect(compiler_1.getNeedle(tower)).to.deep.equal(null);
        chai_1.expect(compiler_1.getNeedle(tower.a)).to.deep.equal(null);
        chai_1.expect(compiler_1.getNeedle(tower.a.b)).to.deep.equal(null);
        chai_1.expect(compiler_1.getNeedle(tower.a.b.d)).to.deep.equal('a.{b,c}.d');
        chai_1.expect(compiler_1.getNeedle(tower.a.b.d.g)).to.deep.equal('!a.b.d.g');
        chai_1.expect(compiler_1.getNeedle(tower.a.c)).to.deep.equal(null);
        chai_1.expect(compiler_1.getNeedle(tower.a.c.d)).to.deep.equal('a.{b,c}.d');
        chai_1.expect(compiler_1.getNeedle(tower.a.c.f)).to.deep.equal('a.{c,e}.f');
        chai_1.expect(compiler_1.getNeedle(tower.a.e)).to.deep.equal(null);
        chai_1.expect(compiler_1.getNeedle(tower.a.e.f)).to.deep.equal('a.{c,e}.f');
        chai_1.expect(compiler_1.getWildcardRegex(tower)).to.deep.equal(undefined);
        chai_1.expect(compiler_1.getWildcardRegex(tower.a)).to.deep.equal(/^a$/);
        chai_1.expect(compiler_1.getWildcardRegex(tower.a.b)).to.deep.equal(/^b$/);
        chai_1.expect(compiler_1.getWildcardRegex(tower.a.b.d)).to.deep.equal(/^d$/);
        chai_1.expect(compiler_1.getWildcardRegex(tower.a.b.d.g)).to.deep.equal(/^g$/);
        chai_1.expect(compiler_1.getWildcardRegex(tower.a.c)).to.deep.equal(/^c$/);
        chai_1.expect(compiler_1.getWildcardRegex(tower.a.c.d)).to.deep.equal(/^d$/);
        chai_1.expect(compiler_1.getWildcardRegex(tower.a.c.f)).to.deep.equal(/^f$/);
        chai_1.expect(compiler_1.getWildcardRegex(tower.a.e)).to.deep.equal(/^e$/);
        chai_1.expect(compiler_1.getWildcardRegex(tower.a.e.f)).to.deep.equal(/^f$/);
        chai_1.expect(compiler_1.getMeta([tower])).to.deep.equal({
            isMatch: false, matchedBy: [], excludedBy: [], traversedBy: ['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g'], parents: null
        });
        chai_1.expect(compiler_1.getMeta([tower.a])).to.deep.equal({
            isMatch: false, matchedBy: [], excludedBy: [], traversedBy: ['a.{b,c}.d', 'a.{c,e}.f', '!a.b.d.g'], parents: null
        });
        chai_1.expect(compiler_1.getMeta([tower.a.b])).to.deep.equal({
            isMatch: false, matchedBy: [], excludedBy: [], traversedBy: ['a.{b,c}.d', '!a.b.d.g'], parents: null
        });
        chai_1.expect(compiler_1.getMeta([tower.a.b.d])).to.deep.equal({
            isMatch: true, matchedBy: ['a.{b,c}.d'], excludedBy: [], traversedBy: ['a.{b,c}.d', '!a.b.d.g'], parents: null
        });
        chai_1.expect(compiler_1.getMeta([tower.a.b.d.g])).to.deep.equal({
            isMatch: false, matchedBy: [], excludedBy: ['!a.b.d.g'], traversedBy: ['!a.b.d.g'], parents: null
        });
        chai_1.expect(compiler_1.getMeta([tower.a.c])).to.deep.equal({
            isMatch: false, matchedBy: [], excludedBy: [], traversedBy: ['a.{b,c}.d', 'a.{c,e}.f'], parents: null
        });
        chai_1.expect(compiler_1.getMeta([tower.a.c.d])).to.deep.equal({
            isMatch: true, matchedBy: ['a.{b,c}.d'], excludedBy: [], traversedBy: ['a.{b,c}.d'], parents: null
        });
        chai_1.expect(compiler_1.getMeta([tower.a.c.f])).to.deep.equal({
            isMatch: true, matchedBy: ['a.{c,e}.f'], excludedBy: [], traversedBy: ['a.{c,e}.f'], parents: null
        });
        chai_1.expect(compiler_1.getMeta([tower.a.e])).to.deep.equal({
            isMatch: false, matchedBy: [], excludedBy: [], traversedBy: ['a.{c,e}.f'], parents: null
        });
        chai_1.expect(compiler_1.getMeta([tower.a.e.f])).to.deep.equal({
            isMatch: true, matchedBy: ['a.{c,e}.f'], excludedBy: [], traversedBy: ['a.{c,e}.f'], parents: null
        });
    });
});
