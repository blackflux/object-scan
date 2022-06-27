# Object-Scan

[![Build Status](https://circleci.com/gh/blackflux/object-scan.png?style=shield)](https://circleci.com/gh/blackflux/object-scan)
[![Test Coverage](https://img.shields.io/coveralls/blackflux/object-scan/master.svg)](https://coveralls.io/github/blackflux/object-scan?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=blackflux/object-scan)](https://dependabot.com)
[![Dependencies](https://david-dm.org/blackflux/object-scan/status.svg)](https://david-dm.org/blackflux/object-scan)
[![NPM](https://img.shields.io/npm/v/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Downloads](https://img.shields.io/npm/dt/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Semantic-Release](https://github.com/blackflux/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)

Traverse object hierarchies using matching and callbacks.

## Install

Install with [npm](https://www.npmjs.com/)

    $ npm install --save object-scan

Or import from <cdn></cdn>

```html
<script type="module">
  import objectScan from 'https://cdn.jsdelivr.net/npm/object-scan@<VERSION>/lib/index.min.js';
  // do logic here
</script>
```

## Usage

<pre><example>
haystack: { a: { b: { c: 'd' }, e: { f: 'g' } } }
needles: ['a.*.f']
spoiler: false
</example></pre>

## Features

- Input [traversed](#traversal_order) at most once during search
- Dependency free and tiny bundle size
- Powerful [matching syntax](#matching)
- Very performant
- Extensive tests and lots of examples

<a id="matching"></a>
## Matching

A needle expression specifies one or more paths to an element (or a set of elements) in a JSON structure.
Paths use the dot notation.

```txt
store.book[0].title
```

The matching syntax is fully validated and bad input will throw a syntax error. The following syntax is supported:
- [Array](#array) and [Object](#object) matching
- [Wildcard](#wildcard) and [Regex](#regex) matching
- [Or Clause](#or_clause)
- [Arbitrary Depth](#arbitrary_depth) and [Nested Path Recursion](#nested_path_recursion)
- [Exclusion](#exclusion)
- [Escaping](#escaping)

<a id="array"></a>
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

<a id="object"></a>
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

<a id="wildcard"></a>
### Wildcard

The following characters have special meaning when not escaped:
- `*`: Match zero or more character
- `+`: Match one or more character
- `?`: Match exactly one character
- `\`: Escape the subsequent character

Can be used with [Array](#array) and [Object](#object) selector.

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

<a id="regex"></a>
### Regex

Regex are defined by using parentheses.

Can be used with [Array](#array) and [Object](#object) selector.

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

<a id="or_clause"></a>
### Or Clause

Or Clauses are defined by using curley brackets.

Can be used with [Array](#array) and [Object](#object) selector
and [Arbitrary Depth](#arbitrary_depth) matching.

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

<a id="arbitrary_depth"></a>
### Arbitrary Depth

There are two types of arbitrary depth matching:
- `**`: Matches zero or more nestings
- `++`: Matches one or more nestings

Can be combined with [Regex](#regex) and [Or Clause](#or_clause) by prepending.

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
haystack: { 1: { 1: ['c', 'd'] }, 510: 'e', foo: { 1: 'f' } }
needles: ['**(1)']
comment: all containing `1` at every level
</example></pre>

<a id="nested_path_recursion"></a>
### Nested Path Recursion

To match a nested path recursively,
combine [Arbitrary Depth](#arbitrary_depth) matching with an [Or Clause](#or_clause).

There are two types of nested path matching:
- `**{...}`: Matches path(s) in [Or Clause](#or_clause) zero or more times
- `++{...}`: Matches path(s) in [Or Clause](#or_clause) one or more times

_Examples_:
<pre><example>
haystack: [[[[0, 1], [1, 2]], [[3, 4], [5, 6]]], [[[7, 8], [9, 10]], [[11, 12], [13, 14]]]]
needles: ['++{[0][1]}']
comment: `cyclic path`
</example></pre>
<pre><example>
haystack: [[0, 1, 2], [3, 4, 5], [6, 7, 8]]
needles: ['++{[0],[1]}']
comment: `nested or`
</example></pre>
<pre><example>
haystack: [[[{ a: [1] }], [2]]]
needles: ['**{[*]}']
comment: `traverse only array`
</example></pre>
<pre><example>
haystack: { a: [0, { b: 1 }], c: { d: 2 } }
needles: ['**{*}']
comment: `traverse only object`
</example></pre>
<pre><example>
haystack: { a: { b: { c: { b: { c: 0 } } } } }
needles: ['a.**{b.c}']
comment: `zero or more times`
</example></pre>
<pre><example>
haystack: { a: { b: { c: { b: { c: 0 } } } } }
needles: ['a.++{b.c}']
comment: `one or more times`
</example></pre>

<a id="exclusion"></a>
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

<a id="escaping"></a>
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
- `gproperty`: current grandparent property.
- `parent`: current parent.
- `gparent`: current grandparent.
- `parents`: array of form `[parent, grandparent, ...]`.
- `isMatch`: true iff last targeting needle exists and is non-excluding.
- `matchedBy`: all non-excluding needles targeting key.
- `excludedBy`: all excluding needles targeting key.
- `traversedBy`: all needles involved in traversing key.
- `isCircular`: true iff `value` contained in `parents`
- `isLeaf`: true iff `value` can not be traversed
- `depth`: length of `key`
- `result`: intermittent result as defined by `rtn`
- `getKey`: function that returns `key`
- `getValue`: function that returns `value`
- `getEntry`: function that returns `entry`
- `getProperty`: function that returns `property`
- `getGproperty`: function that returns `gproperty`
- `getParent`: function that returns `parent`
- `getGparent`: function that returns `gparent`
- `getParents`: function that returns `parents`
- `getIsMatch`: function that returns `isMatch`
- `getMatchedBy`: function that returns `matchedBy`
- `getExcludedBy`: function that returns `excludedBy`
- `getTraversedBy`: function that returns `traversedBy`
- `getIsCircular`: function that returns `isCircular`
- `getIsLeaf`: function that returns `isLeaf`
- `getDepth`: function that returns `depth`
- `getResult`: function that returns `result`
- `context`: as passed into the search

Notes on Performance:
- Arguments backed by getters use [Functions Getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
and should be accessed via [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Unpacking_fields_from_objects_passed_as_function_parameter) to prevent redundant computation.
- Getters should be used to improve performance for conditional access. E.g. `if (isMatch) { getParents() ... }`.
- For performance reasons, the same object is passed to all callbacks.

#### filterFn

Type: `function`<br>
Default: `undefined`

When defined, this callback is invoked for every match. If `false`
is returned, the current key is excluded from the result.

The return value of this callback has no effect when a search context is provided.

Can be used to do processing as matching keys are traversed.

Invoked in same order as matches would appear in result.

For more information on invocation order, please refer to Section [Traversal Order](#traversal_order)

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

When defined, this callback is invoked for every key that is traversed by
the search. If `true` is returned, all keys nested under the current key are
skipped in the search and from the final result.

Note that `breakFn` is invoked before the corresponding `filterFn` might be invoked.

For more information on invocation order, please refer to Section [Traversal Order](#traversal_order)

_Examples_:
<pre><example>
haystack: { a: { b: { c: 0 } } }
needles: ['**']
comment: break function
breakFn: ({ key }) => key === 'a.b'
</example></pre>

#### beforeFn

Type: `function`<br>
Default: `undefined`

When defined, this function is called before traversal as `beforeFn(state = { haystack, context })`.

If a value other than `undefined` is returned from `beforeFn`,
that value is written to `state.haystack` before traversal.

The content of `state` can be modified in the function.
After `beforeFn` has executed, the traversal happens using `state.haystack` and `state.context`.

The content in `state` can be accessed in `afterFn`.
Note however that the key `result` is being overwritten.

_Examples_:
<pre><example>
haystack: { a: 0 }
context: { b: 0 }
needles: ['**']
comment: combining haystack and context
beforeFn: ({ haystack: h, context: c }) => [h, c]
rtn: 'key'
</example></pre>
<pre><example>
haystack: { a: 0, b: 1 }
needles: ['**']
comment: pre-processing haystack
beforeFn: ({ haystack: h }) => Object.keys(h)
rtn: ['key', 'value']
</example></pre>

#### afterFn

Type: `function`<br>
Default: `undefined`

When defined, this function is called after traversal as `afterFn(state = { result, haystack, context })`.

Additional information written to `state` in `beforeFn` is available in `afterFn`.

The content of `state` can be modified in the function. In particular the key `state.result` can be updated.

If a value other than `undefined` is returned from `afterFn`, that value is written to `state.result`.

After `beforeFn` has executed, the key `state.result` is returned as the final result.

_Examples_:
<pre><example>
haystack: { a: 0 }
context: 5
needles: ['**']
comment: returning count plus context
afterFn: ({ result, context }) => result + context
rtn: 'count'
joined: false
</example></pre>
<pre><example>
haystack: { a: 0, b: 3, c: 4 }
needles: ['**']
comment: post-processing result
afterFn: ({ result }) => result.filter((v) => v > 3)
rtn: 'value'
joined: false
</example></pre>
<pre><example>
haystack: {}
needles: ['**']
comment: pass data from beforeFn to afterFn
beforeFn: (state) => { /* eslint-disable no-param-reassign */ state.custom = 7; }
afterFn: (state) => state.custom
joined: false
</example></pre>

#### compareFn

Type: `function`<br>
Default: `undefined`

This function has the same signature as the callback functions. When defined it is expected to return a `function` or `undefined`.

The returned value is used as a comparator to determine the traversal order of any `object` keys.

This works together with the `reverse` option.

Please refer to Section [Traversal Order](#traversal_order) for more information.

_Examples_:
<pre><example>
haystack: { a: 0, c: 1, b: 2 }
needles: ['**']
compareFn: () => (k1, k2) => k1.localeCompare(k2)
comment: simple sort
reverse: false
</example></pre>

#### reverse

Type: `boolean`<br>
Default: `true`

When set to `true`, the traversal is performed in reverse order. This means `breakFn` is executed in _reverse post-order_ and
`filterFn` in _reverse pre-order_. Otherwise `breakFn` is executed in _pre-order_ and `filterFn` in _post-order_.

When `reverse` is `true` the traversal is _delete-safe_. I.e. `property` can be deleted / spliced from `parent` object / array in `filterFn`.

Please refer to Section [Traversal Order](#traversal_order) for more information.

_Examples_:
<pre><example>
haystack: { f: { b: { a: {}, d: { c: {}, e: {} } }, g: { i: { h: {} } } } }
needles: ['**']
context: []
breakFn: ({ isMatch, property, context }) => { if (isMatch) { context.push(property); } }
comment: breakFn, reverse true
reverse: true
joined: false
</example></pre>
<pre><example>
haystack: { f: { b: { a: {}, d: { c: {}, e: {} } }, g: { i: { h: {} } } } }
needles: ['**']
context: []
filterFn: ({ property, context }) => { context.push(property); }
comment: filterFn, reverse true
reverse: true
joined: false
</example></pre>
<pre><example>
haystack: { f: { b: { a: {}, d: { c: {}, e: {} } }, g: { i: { h: {} } } } }
needles: ['**']
context: []
breakFn: ({ isMatch, property, context }) => { if (isMatch) { context.push(property); } }
comment: breakFn, reverse false
reverse: false
joined: false
</example></pre>
<pre><example>
haystack: { f: { b: { a: {}, d: { c: {}, e: {} } }, g: { i: { h: {} } } } }
needles: ['**']
context: []
filterFn: ({ property, context }) => { context.push(property); }
comment: filterFn, reverse false
reverse: false
joined: false
</example></pre>

#### orderByNeedles

Type: `boolean`<br>
Default: `false`

When set to `false`, all targeted keys are traversed and matched
in the order determined by the `compareFn` and `reverse` option.

When set to `true`, all targeted keys are traversed and matched
in the order determined by the corresponding needles,
falling back to the above ordering.

Note that this option is constraint by the depth-first search approach.

_Examples_:
<pre><example>
haystack: { a: 0, b: 1, c: 1 }
needles: ['c', 'a', 'b']
orderByNeedles: true
comment: order by needle
</example></pre>
<pre><example>
haystack: { a: 0, b: 1, c: 1 }
needles: ['b', '*']
orderByNeedles: true
reverse: true
comment: fallback reverse
</example></pre>
<pre><example>
haystack: { a: 0, b: 1, c: 1 }
needles: ['b', '*']
orderByNeedles: true
reverse: false
comment: fallback not reverse
</example></pre>
<pre><example>
haystack: { a: 0, b: { c: 1 }, d: 2 }
needles: ['a', 'b.c', 'd']
orderByNeedles: true
comment: nested match
</example></pre>
<pre><example>
haystack: { a: 0, b: { c: 1 }, d: 2 }
needles: ['b', 'a', 'b.c', 'd']
orderByNeedles: true
comment: matches traverse first
</example></pre>

#### abort

Type: `boolean`<br>
Default: `false`

When set to `true` the traversal immediately returns after the first match.

_Examples_:
<pre><example>
haystack: { a: 0, b: 1 }
needles: ['a', 'b']
joined: false
rtn: 'property'
abort: true
comment: only return first property
</example></pre>
<pre><example>
haystack: ['a', 'b']
needles: ['[0]', '[1]']
joined: false
rtn: 'count'
abort: true
comment: abort changes count
</example></pre>

#### rtn

Type: `string` or `array` or `function`<br>
Default: _dynamic_

Defaults to `key` when search context is _undefined_ and to `context` otherwise.

Can be explicitly set as a `string`:
- `context`: search context is returned
- `key`: as passed into `filterFn`
- `value`: as passed into `filterFn`
- `entry`: as passed into `filterFn`
- `property`: as passed into `filterFn`
- `gproperty`: as passed into `filterFn`
- `parent`: as passed into `filterFn`
- `gparent`: as passed into `filterFn`
- `parents`: as passed into `filterFn`
- `isMatch`: as passed into `filterFn`
- `matchedBy`: as passed into `filterFn`
- `excludedBy`: as passed into `filterFn`
- `traversedBy`: as passed into `filterFn`
- `isCircular`: as passed into `filterFn`
- `isLeaf`: as passed into `filterFn`
- `depth`: as passed into `filterFn`
- `bool`: returns _true_ iff a match is found
- `count`: returns the match count
- `sum`: returns the match sum

When set to `array`, can contain any of the above except `context`, `bool`, `count` and `sum`.

When set to `function`, called with _callback_ signature for every match. Returned value is added to the result.

When **abort** is set to `true` and _rtn_ is not `context`, `bool`, `count` or `sum`,
the first entry of the result or _undefined_ is returned.

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
comment: return entries
</example></pre>
<pre><example>
haystack: { a: { b: { c: 0 } } }
needles: ['a.b.c', 'a']
joined: false
rtn: 'property'
comment: return properties
</example></pre>
<pre><example>
haystack: { a: { b: 0, c: 1 } }
needles: ['a.b', 'a.c']
joined: false
rtn: 'bool'
comment: checks for any match, full traversal
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
<pre><example>
haystack: { a: { b: { c: 0, d: 1 } } }
needles: ['a.b.{c,d}']
joined: false
rtn: ['property', 'value']
context: []
comment: return custom array
</example></pre>
<pre><example>
haystack: { a: { b: { c: 0, d: 1 } } }
needles: ['**']
joined: false
rtn: ({ value }) => value + 1
filterFn: ({ isLeaf }) => isLeaf
comment: return value plus one
</example></pre>
<pre><example>
haystack: { a: { b: { c: -2, d: 1 }, e: [3, 7] } }
needles: ['**']
joined: false
rtn: 'sum'
filterFn: ({ value }) => typeof value === 'number'
comment: return sum
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

<a id="traversal_order"></a>
## Traversal Order

The [traversal order](https://en.wikipedia.org/wiki/Tree_traversal) is always depth first.
However, the order the nodes are traversed in can be changed.

<pre><example>
haystack: { F: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } } }
joined: false
needles: ['**']
context: []
filterFn: ({ context, property }) => { context.push(property); }
comment: Reverse Pre-order
</example></pre>

<pre><example>
haystack: { F: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } } }
joined: false
needles: ['**']
context: []
breakFn: ({ context, property }) => { context.push(property); }
comment: Reverse Post-order
</example></pre>

<pre><example>
haystack: { F: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } } }
joined: false
needles: ['**']
context: []
reverse: false
filterFn: ({ context, property }) => { context.push(property); }
comment: Post-order
</example></pre>

<pre><example>
haystack: { F: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } } }
joined: false
needles: ['**']
context: []
reverse: false
breakFn: ({ context, property }) => { context.push(property); }
comment: Pre-order
</example></pre>

Note that the default traversal order is _delete-safe_. This means that elements from
Arrays can be deleted without impacting the traversal.

<pre><example>
haystack: [0, 1, 2, 3, 4, 5]
joined: false
needles: ['**']
afterFn: ({ haystack }) => haystack
filterFn: ({ parent, property }) => { parent.splice(property, property % 2); }
comment: Deleting from Array
</example></pre>

This is not true when the `reverse` option is set to `false`

<pre><example>
haystack: [0, 1, 2, 3, 4, 5]
joined: false
reverse: false
needles: ['**']
afterFn: ({ haystack }) => haystack
filterFn: ({ parent, property }) => { parent.splice(property, property % 2); }
comment: Deleting from Array Unexpected
</example></pre>

By default, the traversal order depends on the haystack _input order_ and the `reverse` option for the direction.
However, this _input order_ can be altered by using `compareFn` and `orderByNeedles`.

<pre><example>
haystack: { b: 0, a: 1, c: 2 }
joined: false
needles: ['c', 'b', 'a']
context: []
orderByNeedles: true
filterFn: ({ context, property }) => { context.push(property); }
comment: orderByNeedles
</example></pre>

<pre><example>
haystack: { b: 0, a: 1, c: 2 }
joined: false
needles: ['**']
context: []
compareFn: () => (a, b) => b.localeCompare(a)
filterFn: ({ context, property }) => { context.push(property); }
comment: compareFn
</example></pre>

Note that `compareFn` does not work on Arrays.

Both options can be combined, in which case `orderByNeedles` supersedes `compareFn`

<pre><example>
haystack: { b: 0, a: 1, c: 2 }
joined: false
needles: ['c', '*']
orderByNeedles: true
context: []
compareFn: () => (a, b) => b.localeCompare(a)
filterFn: ({ context, property }) => { context.push(property); }
comment: orderByNeedles and compareFn
</example></pre>

## JSONPath and others

How does this library compare to JSONPath and others?
...

TODO: is below really true? Have to think about this more
- JSONPath and similar libraries are meant to single execute operations on object and have powerful querying logic to find nested keys
- Object-Scan is used to process an object hierarchy as a whole and perform multiple operations in parallel, the query logic is more limited

## Real World Uses

...

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

Top level object(s) are matched by the empty needle `''`. This is useful for matching objects nested in arrays by setting `useArraySelector` to `false`.
To match the actual empty string as a key, use `(^$)`.

Note that the empty string does not work to match top level objects with
[_.get](https://lodash.com/docs/#get) or [_.set](https://lodash.com/docs/#set).

_Examples_:
<pre><example>
haystack: [{}, {}]
needles: ['']
useArraySelector: false
comment: match top level objects in array
</example></pre>
<pre><example>
haystack: {}
needles: ['']
comment: match top level object
</example></pre>
<pre><example>
haystack: { '': 0, a: { '': 1 } }
needles: ['**.(^$)']
joined: false
comment: match empty string keys
</example></pre>
<pre><example>
haystack: [0, [{ a: 1 }, 2]]
needles: ['**(^a$)']
useArraySelector: false
comment: star recursion matches roots
</example></pre>

## Internals

This implementation is completely recursion free. This allows
for traversal of deeply nested objects where a recursive approach
would fail with a `Maximum call stack size exceeded` error.

Conceptually this package works as follows:

1. During initialization the needles are parsed and built into a search tree.
Various information is pre-computed and stored for every node.
Finally the search function is returned.

2. When the search function is invoked, the input is traversed simultaneously with
the relevant nodes of the search tree. Processing multiple search tree branches
in parallel allows for a single traversal of the input.

Having a separate initialization stage allows for a performant search and
significant speed ups when applying the same search to different input.
