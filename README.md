# Object-Scan

[![Build Status](https://circleci.com/gh/blackflux/object-scan.png?style=shield)](https://circleci.com/gh/blackflux/object-scan)
[![Test Coverage](https://img.shields.io/coveralls/blackflux/object-scan/master.svg)](https://coveralls.io/github/blackflux/object-scan?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=blackflux/object-scan)](https://dependabot.com)
[![Dependencies](https://david-dm.org/blackflux/object-scan/status.svg)](https://david-dm.org/blackflux/object-scan)
[![NPM](https://img.shields.io/npm/v/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Downloads](https://img.shields.io/npm/dt/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Semantic-Release](https://github.com/blackflux/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)

Find keys in object hierarchies using wildcard and glob matching and callbacks.

## Install

Install with [npm](https://www.npmjs.com/):

    $ npm install --save object-scan

## Usage

<!-- <example>
haystack = { a: { b: { c: 'd' }, e: { f: 'g' } } }
needles = ['a.*.f']
spoiler = false
-->
<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' } } };

objectScan(['a.*.f'], { joined: true })(haystack);
// => [ 'a.e.f' ]
```
<!--
</example> -->

### Features

- Input traversed exactly once during search
- Dependency free, small in size and very performant
- Separate Object and Array matching
- Wildcard and Regex matching
- Arbitrary depth matching
- Or-clause Syntax
- Exclusion Matching
- Full support for escaping
- Results returned in "delete-safe" order
- Search syntax is checked for correctness
- Lots of tests to ensure correctness

### Search Context

A context can be passed into a search invocation as a second parameter. It is available in all callbacks
and can be used to manage state across a search invocation without having to recompile the search.

By default all matched keys are returned from a search invocation.
However, when it is not undefined, the context is returned instead.

### Options

Signature of all callbacks is

    Fn({
      key, value, parent, parents, isMatch, matchedBy, excludedBy, traversedBy, isCircular
      getKey, getValue, getParent, getParents, getIsMatch, getMatchedBy, getExcludedBy, getTraversedBy, getIsCircular
      context
    })

where:

- `key`: key that callback is invoked for (respects `joined` option).
- `value`: value for key.
- `parent`: current parent.
- `parents`: array of form `[parent, grandparent, ...]`.
- `isMatch`: true iff last targeting needle exists and is non-excluding.
- `matchedBy`: all non-excluding needles targeting key.
- `excludedBy`: all excluding needles targeting key.
- `traversedBy`: all needles involved in traversing key.
- `isCircular`: true iff `value` contained in `parents`
- `getKey`: function that returns `key`
- `getValue`: function that returns `value`
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

#### breakFn

Type: `function`<br>
Default: `undefined`

If defined, this callback is invoked for every key that is traversed by
the search. If `true` is returned, all keys nested under the current key are
skipped in the search and from the final result.

Note that `breakFn` is invoked before the corresponding `filterFn` might be invoked.

#### joined

Type: `boolean`<br>
Default: `false`

Keys are returned as a string when set to `true` instead of as a list.

Setting this option to `true` will negatively impact performance.

Note that [_.get](https://lodash.com/docs/#get) and [_.set](https://lodash.com/docs/#set) fully support lists.

#### useArraySelector

Type: `boolean`<br>
Default: `true`

When set to `false`, no array selectors should be used in any needles and arrays are automatically traversed.

Note that the results still include the array selectors.

#### strict

Type: `boolean`<br>
Default: `true`

When set to `true`, errors are thrown when:
- a path is identical to a previous path
- a path invalidates a previous path
- a path contains consecutive recursions

## Matching

Matching is based on the Javascript Object / Array selector syntax
with some notable extensions.

### Array vs Object

To match an Array path, rectangular brackets are used.<br>
_Examples_:
- `[2]` would match `[2]` in an array

To match an Object path, the name of the path is used.<br>
_Examples_:
- `foo` would match the path `foo` in an object

### Wildcard

Wildcards can be used with Array and Object selector.

The following characters have special meaning when not escaped:
- `*`: Match zero or more character
- `+`: Match one or more character
- `?`: Match exactly one character
- `\`: Escape the subsequent character

_Examples_
- `[1?]` would match `[10], [11], .., [18], [19]` in an array.

### Regex

Regex can be used with Array and Object selector by using parentheses.

_Examples_:<br>
- `(^foo)` would match all object paths starting with `foo`
- `[(5)]` would match all array paths containing `5`

### Arbitrary Depth

There are two types of recursion matching:
- `**`: Matches zero or more nestings
- `++`: Matches one or more nestings

Recursions can be combined with a regex by appending the regex.

_Examples_:
- `++(1)` would recursively match all paths (Array and Object) that contain `1`.

### Or Clause

Can be used with Array and Object selector by using curley brackets.

This makes it possible to target multiple paths in a single needle. It also
makes it easier to reduce redundancy.

_Examples_:
- `[{0,1}]` would match the first and second path in an array
- `[{0,1}]` behaves identical to `[(^[01]$)]`

### Exclusion

To exclude a path from being matched, use the exclamation mark.

_Examples_:
- `**,!**.a` matches all paths, except those where the last segment is `a`.

### Escaping

The following characters are considered special and need to
be escaped using `\`, if they should be matched in a key:<br>
`[`, `]`, `{`, `}`, `(`, `)`, `,`, `.`, `!`, `?`, `*`, `+` and `\`.

## Examples

More extensive examples can be found in the tests.

<!-- <example>
haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' }
needles = ['*']
comment = top level keys
-->
<details><summary> <code>['*']</code> <em>(top level keys)</em> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['*'], { joined: true })(haystack);
// => [ 'k', 'a' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['a.*.f']
comment = nested keys
-->
<details><summary> <code>['a.*.f']</code> <em>(nested keys)</em> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['a.*.f'], { joined: true })(haystack);
// => [ 'a.e.f' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['*.*.*']
comment = multiple nested keys
-->
<details><summary> <code>['*.*.*']</code> <em>(multiple nested keys)</em> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['*.*.*'], { joined: true })(haystack);
// => [ 'a.e.f', 'a.b.c' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['a.*.{c,f}']
comment = or filter
-->
<details><summary> <code>['a.*.{c,f}']</code> <em>(or filter)</em> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['a.*.{c,f}'], { joined: true })(haystack);
// => [ 'a.e.f', 'a.b.c' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['a.*.{c,f}']
comment = or filter, not joined
joined = false
-->
<details><summary> <code>['a.*.{c,f}']</code> <em>(or filter, not joined)</em> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['a.*.{c,f}'], { joined: false })(haystack);
// => [ [ 'a', 'e', 'f' ], [ 'a', 'b', 'c' ] ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['*.*[*]']
-->
<details><summary> <code>['*.*[*]']</code> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['*.*[*]'], { joined: true })(haystack);
// => [ 'a.h[1]', 'a.h[0]' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['*[*]']
-->
<details><summary> <code>['*[*]']</code> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['*[*]'], { joined: true })(haystack);
// => []
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['**']
-->
<details><summary> <code>['**']</code> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['**'], { joined: true })(haystack);
// => [ 'k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b.c', 'a.b', 'a' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['++']
-->
<details><summary> <code>['++']</code> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['++'], { joined: true })(haystack);
// => [ 'k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b.c', 'a.b', 'a' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['**.f']
-->
<details><summary> <code>['**.f']</code> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['**.f'], { joined: true })(haystack);
// => [ 'a.e.f' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['**[*]']
-->
<details><summary> <code>['**[*]']</code> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['**[*]'], { joined: true })(haystack);
// => [ 'a.h[1]', 'a.h[0]' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['a.*,!a.e']
-->
<details><summary> <code>['a.*,!a.e']</code> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['a.*,!a.e'], { joined: true })(haystack);
// => [ 'a.h', 'a.b' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['**.(^[bc]$)']
-->
<details><summary> <code>['**.(^[bc]$)']</code> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['**.(^[bc]$)'], { joined: true })(haystack);
// => [ 'a.b.c', 'a.b' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['**']
comment = filter function
-->
<details><summary> <code>['**']</code> <em>(filter function)</em> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['**'], { joined: true })(haystack);
// => [ 'k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b.c', 'a.b', 'a' ]
```
</details>
<!--
</example> -->

<!-- <example>
needles = ['**']
comment = break function
-->
<details><summary> <code>['**']</code> <em>(break function)</em> </summary>

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };

objectScan(['**'], { joined: true })(haystack);
// => [ 'k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b.c', 'a.b', 'a' ]
```
</details>
<!--
</example> -->

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
