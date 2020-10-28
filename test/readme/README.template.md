# Object-Scan

[![Build Status](https://circleci.com/gh/blackflux/object-scan.png?style=shield)](https://circleci.com/gh/blackflux/object-scan)
[![Test Coverage](https://img.shields.io/coveralls/blackflux/object-scan/master.svg)](https://coveralls.io/github/blackflux/object-scan?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=blackflux/object-scan)](https://dependabot.com)
[![Dependencies](https://david-dm.org/blackflux/object-scan/status.svg)](https://david-dm.org/blackflux/object-scan)
[![NPM](https://img.shields.io/npm/v/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Downloads](https://img.shields.io/npm/dt/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Semantic-Release](https://github.com/blackflux/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)

Find keys in object hierarchies using wildcard and regex matching and callbacks.

## Install

Install with [npm](https://www.npmjs.com/):

    $ npm install --save object-scan

## Usage

<pre><example>
haystack: { a: { b: { c: 'd' }, e: { f: 'g' } } }
needles: ['a.*.f']
spoiler: false
</example></pre>

## Features

- Input traversed exactly once during search
- Dependency free, small in size and very performant
- Separate Object and Array matching
- Wildcard and Regex matching
- Arbitrary depth matching
- Or-clause Syntax
- Exclusion Matching
- Full support for escaping
- Results returned in "delete-safe" order
- Recursion free implementation
- Search syntax validated
- Lots of tests

## Matching

A needle expression specifies one or more paths to an element (or a set of elements) in a JSON structure. Paths use the dot notation:

```txt
store.book[0].title
```

### Array

Rectangular brackets for array path matching.

_Examples_:
<pre><example>
haystack: [0, 1, 2, 3, 4]
needles: ['[2]']
comment: exact in array
</example></pre>
<pre><example>
haystack: { 0: 'a', 1: 'b', 2: 'c' }
needles: ['[1]']
comment: no match in object
</example></pre>

### Object

Property name for object property matching.

_Examples_:
<pre><example>
haystack: { foo: 0, bar: 1 }
needles: ['foo']
comment: exact in object
</example></pre>
<pre><example>
haystack: [0, 1, 2, 3, 4]
needles: ['1']
comment: no match in array
</example></pre>

### Wildcard

The following characters have special meaning when not escaped:
- `*`: Match zero or more character
- `+`: Match one or more character
- `?`: Match exactly one character
- `\`: Escape the subsequent character

Wildcards can be used with Array and Object selector.

_Examples_:
<pre><example>
haystack: { a: { b: 0, c: 1 }, d: 2 }
needles: ['*']
comment: top level
</example></pre>
<pre><example>
haystack: [...Array(30).keys()]
needles: ['[?5]']
comment: two digit ending in five
</example></pre>
<pre><example>
haystack: { a: { b: { c: 0 }, d: { f: 0 } } }
needles: ['a.+.c']
comment: nested
</example></pre>
<pre><example>
haystack: { a: { b: { c: 0 }, '+': { c: 0 } } }
needles: ['a.\\+.c']
comment: escaped
</example></pre>

### Regex

Regex are defined by using parentheses.

Can be used with Array and Object selector.

_Examples_:
<pre><example>
haystack: { foo: 0, foobar: 1, bar: 2 }
needles: ['(^foo)']
comment: starting with `foo`
</example></pre>
<pre><example>
haystack: [...Array(20).keys()]
needles: ['[(5)]']
comment: containing `5`
</example></pre>
<pre><example>
haystack: ['a', 'b', 'c', 'd']
needles: ['[(^[01]$)]']
comment: `[0]` and `[1]`
</example></pre>
<pre><example>
haystack: ['a', 'b', 'c', 'd']
needles: ['[(^[^01]$)]']
comment: other than `[0]` and `[1]`
</example></pre>
<pre><example>
haystack: ['a', 'b', 'c', 'd']
needles: ['[*]', '[!(^[01]$)]']
comment: match all and exclude `[0]` and `[1]`
</example></pre>

### Arbitrary Depth

There are two types of arbitrary depth matching:
- `**`: Matches zero or more nestings
- `++`: Matches one or more nestings

Recursions can be combined with a regex by appending the regex.

_Examples_:
<pre><example>
haystack: { a: { b: 0, c: 0 } }
needles: ['a.**']
comment: zero or more nestings under `a`
</example></pre>
<pre><example>
haystack: { a: { b: 0, c: 0 } }
needles: ['a.++']
comment: one or more nestings under `a`
</example></pre>
<pre><example>
haystack: { 0: { 1: ['a', 'b'] }, 1: { 1: ['c', 'd'] }, 510: 'e', foo: { 1: 'f' } }
needles: ['**(1)']
comment: all containing `1` at every level
</example></pre>

### Or Clause

Or Clauses are defined by using curley brackets.

Can be used with Array and Object selector.

_Examples_:
<pre><example>
haystack: ['a', 'b', 'c', 'd']
needles: ['[{0,1}]']
comment: `[0]` and `[1]`
</example></pre>
<pre><example>
haystack: { a: { b: 0, c: 1 }, d: { e: 2, f: 3 } }
needles: ['{a,d}.{b,f}']
comment: `a.b`, `a.f`, `d.b` and `d.f`
</example></pre>

### Exclusion

To exclude a path, use exclamation mark.

_Examples_:
<pre><example>
haystack: { a: 0, b: 1 }
needles: ['{a,b},!a']
comment: only `b`
strict: false
</example></pre>
<pre><example>
haystack: { a: 0, b: { a: 1, c: 2 } }
needles: ['**,!**.a']
comment: all except ending in `a`
</example></pre>

### Escaping

The following characters are considered special and need to
be escaped using `\`, if they should be matched in a key:<br>
`[`, `]`, `{`, `}`, `(`, `)`, `,`, `.`, `!`, `?`, `*`, `+` and `\`.

_Examples:_
<pre><example>
haystack: { '[1]': 0 }
needles: ['\\[1\\]']
comment: special object key
</example></pre>

## Options

Signature of all callbacks is

    Fn({ key, value, ... })

where:

- `key`: key that callback is invoked for (respects `joined` option).
- `value`: value for key.
- `entry`: entry consisting of [`key`, `value`].
- `property`: current parent property.
- `parent`: current parent.
- `parents`: array of form `[parent, grandparent, ...]`.
- `isMatch`: true iff last targeting needle exists and is non-excluding.
- `matchedBy`: all non-excluding needles targeting key.
- `excludedBy`: all excluding needles targeting key.
- `traversedBy`: all needles involved in traversing key.
- `isCircular`: true iff `value` contained in `parents`
- `getKey`: function that returns `key`
- `getValue`: function that returns `value`
- `getEntry`: function that returns `entry`
- `getProperty`: function that returns `property`
- `getParent`: function that returns `parent`
- `getParents`: function that returns `parents`
- `getIsMatch`: function that returns `isMatch`
- `getMatchedBy`: function that returns `matchedBy`
- `getExcludedBy`: function that returns `excludedBy`
- `getTraversedBy`: function that returns `traversedBy`
- `getIsCircular`: function that returns `isCircular`
- `context`: as passed into the search

Notes on Performance:
- Arguments backed by getters use [Functions Getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
and should be accessed via [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Unpacking_fields_from_objects_passed_as_function_parameter) to prevent redundant computation.
- Getters should be used to improve performance for conditional access. E.g. `if (isMatch) { getParents() ... }`.
- For performance reasons, the same object is passed to all callbacks.

#### filterFn

Type: `function`<br>
Default: `undefined`

If defined, this callback is invoked for every match. If `false`
is returned, the current key is excluded from the result.

The return value of this callback has no effect when a search context is provided.

Can be used to do processing as matching keys are traversed.

Invoked in same order as matches would appear in result.

This method is conceptually similar to
[Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

_Examples_:
<pre><example>
haystack: { a: 0, b: 'bar' }
needles: ['**']
comment: filter function
filterFn: ({ value }) => typeof value === 'string'
</example></pre>

#### breakFn

Type: `function`<br>
Default: `undefined`

If defined, this callback is invoked for every key that is traversed by
the search. If `true` is returned, all keys nested under the current key are
skipped in the search and from the final result.

Note that `breakFn` is invoked before the corresponding `filterFn` might be invoked.

_Examples_:
<pre><example>
haystack: { a: { b: { c: 0 } } }
needles: ['**']
comment: break function
breakFn: ({ key }) => key === 'a.b'
</example></pre>

#### abort

Type: `boolean`<br>
Default: `false`

When set to `true` the scan immediately returns after the first match.

_Examples_:
<pre><example>
haystack: ['a', 'b']
needles: ['[0]', '[1]']
joined: false
rtn: 'count'
abort: true
comment: abort changes count
</example></pre>
<pre><example>
haystack: { a: 0, b: 1 }
needles: ['a', 'b']
joined: false
rtn: 'property'
abort: true
comment: only return first property
</example></pre>

#### rtn

Type: `string`<br>
Default: _dynamic_

Defaults to `key` when search context is _undefined_ and to `context` otherwise.

Can be explicitly set as:
- `context`: search context is returned
- `key`: matched keys are returned
- `value`: matched values are returned
- `entry`: matched entries are returned
- `property`: matched properties are returned
- `parent`: matched parent are returned
- `parents`: matched parents are returned
- `bool`: returns _true_ iff a match is found
- `count`: returns the match count

When **abort** is set to `true` and the result would be a list, the first match or _undefined_ is returned.

_Examples_:
<pre><example>
haystack: ['a', 'b', 'c']
needles: ['[*]']
joined: false
rtn: 'value'
comment: return values
</example></pre>
<pre><example>
haystack: { foo: ['bar'] }
needles: ['foo[*]']
joined: false
rtn: 'entry'
context: []
comment: return entries
</example></pre>
<pre><example>
haystack: { a: { b: { c: 0 } } }
needles: ['a.b.c', 'a']
joined: false
rtn: 'property'
context: []
comment: return properties
</example></pre>
<pre><example>
haystack: { a: { b: 0, c: 1 } }
needles: ['a.b', 'a.c']
joined: false
rtn: 'bool'
comment: checks for any match, full scan
</example></pre>
<pre><example>
haystack: { a: 0 }
needles: ['**']
joined: false
rtn: 'context'
comment: return not provided context
</example></pre>
<pre><example>
haystack: { a: { b: { c: 0, d: 1 } } }
needles: ['a.b.{c,d}']
joined: false
rtn: 'key'
context: []
comment: return keys with context passed
</example></pre>

#### joined

Type: `boolean`<br>
Default: `false`

Keys are returned as a string when set to `true` instead of as a list.

Setting this option to `true` will negatively impact performance.

Note that [_.get](https://lodash.com/docs/#get) and [_.set](https://lodash.com/docs/#set) fully support lists.

_Examples_:
<pre><example>
haystack: [0, 1, { foo: 'bar' }]
needles: ['[*]', '[*].foo']
joined: true
comment: joined
</example></pre>
<pre><example>
haystack: [0, 1, { foo: 'bar' }]
needles: ['[*]', '[*].foo']
joined: false
comment: not joined
</example></pre>

#### useArraySelector

Type: `boolean`<br>
Default: `true`

When set to `false`, no array selectors should be used in any needles and arrays are automatically traversed.

Note that the results still include the array selectors.

_Examples_:
<pre><example>
haystack: [{ a: 0 }, { b: [{ c: 1 }, { d: 2 }] }]
needles: ['a', 'b.d']
useArraySelector: false
comment: automatic array traversal
</example></pre>
<pre><example>
haystack: [{ a: 0 }, { b: 1 }]
needles: ['']
useArraySelector: false
comment: top level array matching
</example></pre>

#### strict

Type: `boolean`<br>
Default: `true`

When set to `true`, errors are thrown when:
- a path is identical to a previous path
- a path invalidates a previous path
- a path contains consecutive recursions

_Examples_:
<pre><example>
haystack: []
needles: ['a.b', 'a.b']
comment: identical
</example></pre>
<pre><example>
haystack: []
needles: ['a.{b,b}']
comment: identical, same needle
</example></pre>
<pre><example>
haystack: []
needles: ['a.b', 'a.**']
comment: invalidates previous
</example></pre>
<pre><example>
haystack: []
needles: ['**.!**']
comment: consecutive recursion
</example></pre>

### Search Context

A context can be passed into a search invocation as a second parameter. It is available in all callbacks
and can be used to manage state across a search invocation without having to recompile the search.

By default all matched keys are returned from a search invocation.
However, when it is not _undefined_, the context is returned instead.

_Examples_:
<pre><example>
haystack: { a: { b: { c: 2, d: 11 }, e: 7 } }
needles: ['**.{c,d,e}']
context: { sum: 0 }
filterFn: ({ value, context }) => { context.sum += value; }
comment: sum values
</example></pre>

## Examples

More extensive examples can be found in the tests.

<pre><example>
haystack: { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' }
needles: ['a.*.f']
comment: nested
</example></pre>

<pre><example>
needles: ['*.*.*']
comment: multiple nested
</example></pre>

<pre><example>
needles: ['a.*.{c,f}']
comment: or filter
</example></pre>

<pre><example>
needles: ['a.*.{c,f}']
comment: or filter, not joined
joined: false
</example></pre>

<pre><example>
needles: ['*.*[*]']
comment: list filter
</example></pre>

<pre><example>
needles: ['*[*]']
comment: list filter, unmatched
</example></pre>

<pre><example>
needles: ['**']
comment: star recursion
</example></pre>

<pre><example>
needles: ['++.++']
comment: plus recursion
</example></pre>

<pre><example>
needles: ['**.f']
comment: star recursion ending in f
</example></pre>

<pre><example>
needles: ['**[*]']
comment: star recursion ending in array
</example></pre>

<pre><example>
needles: ['a.*,!a.e']
comment: exclusion filter
</example></pre>

<pre><example>
needles: ['**.(^[bc]$)']
comment: regex matching
</example></pre>

## Edge Cases

The top level object(s) are matched by the empty needle `""`.
Useful for matching objects nested in arrays by setting `useArraySelector` to `false`.
Note that the empty string does not work with [_.get](https://lodash.com/docs/#get) and [_.set](https://lodash.com/docs/#set).

## Internals

Conceptually this package works as follows:

1. During initialization the needles are parsed and built into a search tree.
Various information is pre-computed and stored for every node.
Finally the search function is returned.

2. When the search function is invoked, the input is traversed simultaneously with
the relevant nodes of the search tree. Processing multiple search tree branches
in parallel allows for a single traversal of the input.

Having a separate initialization stage allows for a performant search and
significant speed ups when applying the same search to different input.
