"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const compiler_1 = require("./util/compiler");
const helper_1 = require("./util/helper");
const specialChars = /[?!,.*[\]{}]/g;
// @ts-ignore
const escape = (input) => input.replace(specialChars, '\\$&');
const isWildcardMatch = (wildcard, key, isArray, subSearch) => {
    if (wildcard === '**') {
        return true;
    }
    if (wildcard === (isArray ? '[*]' : '*')) {
        return true;
    }
    if (isArray && !wildcard.match(/^\[.*]$/)) {
        return false;
    }
    return (isArray ? `[${key}]` : escape(key)).match(compiler_1.getWildcardRegex(subSearch));
};
const formatPath = (input, ctx) => (ctx.joined ? input.reduce((p, c) => `${p}${typeof c === 'number' ? `[${c}]` : `${p ? '.' : ''}${escape(c)}`}`, '') : [...input]);
const find = (haystack_, searches_, ctx) => {
    const result = [];
    const stack = [false, searches_, null, 0];
    const path = [];
    const parents = [];
    let haystack = haystack_;
    do {
        const depth = stack.pop();
        const segment = stack.pop();
        const searches = stack.pop();
        const isResult = stack.pop();
        const diff = path.length - depth;
        for (let idx = 0; idx < diff; idx += 1) {
            parents.pop();
            path.pop();
        }
        if (diff === -1) {
            parents.push(haystack);
            path.push(segment);
            haystack = haystack[segment];
        }
        else if (segment !== null) {
            path[path.length - 1] = segment;
            haystack = parents[parents.length - 1][segment];
        }
        else {
            haystack = haystack_;
        }
        if (isResult) {
            if (ctx.filterFn === undefined
                || ctx.filterFn(formatPath(path, ctx), haystack, compiler_1.getMeta(searches, parents)) !== false) {
                result.push(formatPath(path, ctx));
            }
            // eslint-disable-next-line no-continue
            continue;
        }
        if (!searches.some((s) => compiler_1.hasMatches(s))) {
            // eslint-disable-next-line no-continue
            continue;
        }
        const recurseHaystack = ctx.breakFn === undefined
            || ctx.breakFn(formatPath(path, ctx), haystack, compiler_1.getMeta(searches, parents)) !== true;
        if (ctx.useArraySelector === false && Array.isArray(haystack)) {
            if (recurseHaystack) {
                for (let idx = 0, len = haystack.length; idx < len; idx += 1) {
                    stack.push(false, searches, idx, depth + 1);
                }
            }
            // eslint-disable-next-line no-continue
            continue;
        }
        if (compiler_1.isMatch(helper_1.findLast(searches, (s) => compiler_1.isLeaf(s)))) {
            stack.push(true, searches, segment, depth);
        }
        if (searches[0][''] !== undefined && path.find((p) => typeof p === 'string') === undefined) {
            assert_1.default(searches.length === 1);
            stack.push(false, [searches[0]['']], segment, depth);
        }
        if (recurseHaystack && haystack instanceof Object) {
            const isArray = Array.isArray(haystack);
            const keys = isArray ? haystack : Object.keys(haystack);
            for (let kIdx = 0, kLen = keys.length; kIdx < kLen; kIdx += 1) {
                const key = isArray ? kIdx : keys[kIdx];
                const searchesOut = [];
                for (let sIdx = 0, sLen = searches.length; sIdx < sLen; sIdx += 1) {
                    const search = searches[sIdx];
                    const recursionPos = compiler_1.isRecursive(search) ? compiler_1.getRecursionPos(search) : null;
                    if (recursionPos === 0) {
                        searchesOut.push(search);
                    }
                    const entries = compiler_1.getEntries(search);
                    for (let eIdx = 0, eLen = entries.length; eIdx < eLen; eIdx += 1) {
                        const entry = entries[eIdx];
                        if (isWildcardMatch(entry[0], key, isArray, entry[1])) {
                            searchesOut.push(entry[1]);
                        }
                        if (eIdx + 1 === recursionPos) {
                            searchesOut.push(search);
                        }
                    }
                }
                stack.push(false, searchesOut, key, depth + 1);
            }
        }
    } while (stack.length !== 0);
    return result;
};
exports.default = (needles, opts = {}) => {
    assert_1.default(Array.isArray(needles));
    assert_1.default(opts instanceof Object && !Array.isArray(opts));
    if (needles.length === 0) {
        return () => [];
    }
    const ctx = {
        filterFn: undefined,
        breakFn: undefined,
        joined: true,
        useArraySelector: true,
        strict: true,
        ...opts
    };
    assert_1.default(Object.keys(ctx).length === 5, 'Unexpected Option provided!');
    assert_1.default(['function', 'undefined'].includes(typeof ctx.filterFn));
    assert_1.default(['function', 'undefined'].includes(typeof ctx.breakFn));
    assert_1.default(typeof ctx.joined === 'boolean');
    assert_1.default(typeof ctx.useArraySelector === 'boolean');
    assert_1.default(typeof ctx.strict === 'boolean');
    const search = compiler_1.compile(needles, ctx.strict); // keep separate for performance
    return (haystack) => find(haystack, [search], ctx);
};
