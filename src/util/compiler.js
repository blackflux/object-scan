"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* compile needles to hierarchical map object */
const parser_1 = __importDefault(require("./parser"));
const helper_1 = require("./helper");
const LEAF = Symbol('leaf');
const markLeaf = (input, match, readonly) => helper_1.defineProperty(input, LEAF, match, readonly);
const isLeaf = (input) => input[LEAF] !== undefined;
exports.isLeaf = isLeaf;
const isMatch = (input) => input !== undefined && input[LEAF] === true;
exports.isMatch = isMatch;
const HAS_MATCHES = Symbol('has-matches');
const setHasMatches = (input) => helper_1.defineProperty(input, HAS_MATCHES, true);
const hasMatches = (input) => input[HAS_MATCHES] === true;
exports.hasMatches = hasMatches;
const NEEDLE = Symbol('needle');
const setNeedle = (input, needle, readonly) => helper_1.defineProperty(input, NEEDLE, needle, readonly);
const getNeedle = (input) => (input[NEEDLE] === undefined ? null : input[NEEDLE]);
exports.getNeedle = getNeedle;
const NEEDLES = Symbol('needles');
const addNeedle = (input, needle) => {
    if (input[NEEDLES] === undefined) {
        helper_1.defineProperty(input, NEEDLES, new Set());
    }
    input[NEEDLES].add(needle);
};
const getNeedles = (input) => [...input[NEEDLES]];
exports.getNeedles = getNeedles;
const WILDCARD_REGEX = Symbol('wildcard-regex');
const setWildcardRegex = (input, wildcard) => helper_1.defineProperty(input, WILDCARD_REGEX, helper_1.parseWildcard(wildcard));
const getWildcardRegex = (input) => input[WILDCARD_REGEX];
exports.getWildcardRegex = getWildcardRegex;
const RECURSIVE = Symbol('recursive');
const markRecursive = (input) => helper_1.defineProperty(input, RECURSIVE, true);
const isRecursive = (input) => input[RECURSIVE] === true;
exports.isRecursive = isRecursive;
const RECURSION_POS = Symbol('recursion-pos');
const setRecursionPos = (input, pos, readonly) => helper_1.defineProperty(input, RECURSION_POS, pos, readonly);
const getRecursionPos = (input) => input[RECURSION_POS] || 0;
exports.getRecursionPos = getRecursionPos;
const ENTRIES = Symbol('entries');
const setEntries = (input, entries) => helper_1.defineProperty(input, ENTRIES, entries);
const getEntries = (input) => input[ENTRIES];
exports.getEntries = getEntries;
exports.getMeta = (() => {
    const extractNeedles = (input) => Array.from(input.reduce((p, e) => {
        const needle = getNeedle(e);
        if (needle !== null) {
            p.add(needle);
        }
        return p;
    }, new Set()));
    return (inputs, parents = null) => ({
        isMatch: isMatch(helper_1.findLast(inputs, (s) => isLeaf(s))),
        matchedBy: extractNeedles(inputs.filter((e) => isMatch(e))),
        excludedBy: extractNeedles(inputs.filter((e) => !isMatch(e))),
        traversedBy: Array.from(inputs.reduce((p, e) => {
            getNeedles(e).forEach((n) => p.add(n));
            return p;
        }, new Set())),
        parents: parents !== null ? [...parents].reverse() : null
    });
})();
const buildRecursive = (tower, path, ctx, excluded, root = false) => {
    addNeedle(tower, ctx.needle);
    if (path.length === 0) {
        if (tower[NEEDLE] !== undefined && ctx.strict) {
            throw new Error(`Redundant Needle Target: "${tower[NEEDLE]}" vs "${ctx.needle}"`);
        }
        setNeedle(tower, ctx.needle, ctx.strict);
        markLeaf(tower, !excluded, ctx.strict);
        if (isRecursive(tower)) {
            setRecursionPos(tower, Object.keys(tower).length, ctx.strict);
        }
        return;
    }
    if (Array.isArray(path[0])) {
        buildRecursive(tower, [...path[0], ...path.slice(1)], ctx, excluded);
        return;
    }
    if (path[0] instanceof Set) {
        path[0].forEach((c) => buildRecursive(tower, [c, ...path.slice(1)], ctx, excluded));
        return;
    }
    if (tower[path[0]] === undefined) {
        Object.assign(tower, { [path[0]]: {} });
        if (String(path[0]) === '**') {
            markRecursive(tower[path[0]]);
        }
        setWildcardRegex(tower[path[0]], path[0]);
    }
    if (excluded && path[0].isExcluded()) {
        throw new Error(`Redundant Exclusion: "${ctx.needle}"`);
    }
    if (root === false && String(path[0]) === '**') {
        buildRecursive(tower, path.slice(1), ctx, excluded || path[0].isExcluded());
    }
    buildRecursive(tower[path[0]], path.slice(1), ctx, excluded || path[0].isExcluded());
};
const finalizeRecursive = (tower) => {
    const towerValues = Object.values(tower);
    towerValues.forEach((v) => finalizeRecursive(v));
    if (isMatch(tower) || towerValues.some((v) => hasMatches(v))) {
        setHasMatches(tower);
    }
    setEntries(tower, Object.entries(tower).filter(([k]) => k !== ''));
};
exports.compile = (needles, strict = true) => {
    const tower = {};
    needles.forEach((needle) => buildRecursive(tower, [parser_1.default(needle)], { needle, strict }, false, true));
    finalizeRecursive(tower);
    return tower;
};
