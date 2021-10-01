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

Install with [npm](https://www.npmjs.com/):

    $ npm install --save object-scan

## Usage

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' } } };
objectScan(['a.*.f'], { joined: true })(haystack);
// => [ 'a.e.f' ]
```


## Features

- Input traversed exactly once during search
- Dependency free, small in size and very performant
- Separate Object and Array matching
- Wildcard and Regex matching
- Arbitrary depth matching
- Or-clause Syntax
- Exclusion Matching
- Full support for escaping
- Traversal in "delete-safe" order
- Recursion free implementation
- Search syntax validated
- Lots of tests and examples

## Matching

A needle expression specifies one or more paths to an element (or a set of elements) in a JSON structure. Paths use the dot notation:

```txt
store.book[0].title
```

### Array

Rectangular brackets for array path matching.

_Examples_:
<details><summary> <code>['[2]']</code> <em>(exact in array)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [0, 1, 2, 3, 4];
objectScan(['[2]'], { joined: true })(haystack);
// => [ '[2]' ]
```
</details>
<details><summary> <code>['[1]']</code> <em>(no match in object)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { 0: 'a', 1: 'b', 2: 'c' };
objectScan(['[1]'], { joined: true })(haystack);
// => []
```
</details>

### Object

Property name for object property matching.

_Examples_:
<details><summary> <code>['foo']</code> <em>(exact in object)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { foo: 0, bar: 1 };
objectScan(['foo'], { joined: true })(haystack);
// => [ 'foo' ]
```
</details>
<details><summary> <code>['1']</code> <em>(no match in array)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [0, 1, 2, 3, 4];
objectScan(['1'], { joined: true })(haystack);
// => []
```
</details>

### Wildcard

The following characters have special meaning when not escaped:
- `*`: Match zero or more character
- `+`: Match one or more character
- `?`: Match exactly one character
- `\`: Escape the subsequent character

Wildcards can be used with Array and Object selector.

_Examples_:
<details><summary> <code>['*']</code> <em>(top level)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: 0, c: 1 }, d: 2 };
objectScan(['*'], { joined: true })(haystack);
// => [ 'd', 'a' ]
```
</details>
<details><summary> <code>['[?5]']</code> <em>(two digit ending in five)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [...Array(30).keys()];
objectScan(['[?5]'], { joined: true })(haystack);
// => [ '[25]', '[15]' ]
```
</details>
<details><summary> <code>['a.+.c']</code> <em>(nested)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0 }, d: { f: 0 } } };
objectScan(['a.+.c'], { joined: true })(haystack);
// => [ 'a.b.c' ]
```
</details>
<details><summary> <code>['a.\\+.c']</code> <em>(escaped)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0 }, '+': { c: 0 } } };
objectScan(['a.\\+.c'], { joined: true })(haystack);
// => [ 'a.\\+.c' ]
```
</details>

### Regex

Regex are defined by using parentheses.

Can be used with Array and Object selector.

_Examples_:
<details><summary> <code>['(^foo)']</code> <em>(starting with `foo`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { foo: 0, foobar: 1, bar: 2 };
objectScan(['(^foo)'], { joined: true })(haystack);
// => [ 'foobar', 'foo' ]
```
</details>
<details><summary> <code>['[(5)]']</code> <em>(containing `5`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [...Array(20).keys()];
objectScan(['[(5)]'], { joined: true })(haystack);
// => [ '[15]', '[5]' ]
```
</details>
<details><summary> <code>['[(^[01]$)]']</code> <em>(`[0]` and `[1]`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = ['a', 'b', 'c', 'd'];
objectScan(['[(^[01]$)]'], { joined: true })(haystack);
// => [ '[1]', '[0]' ]
```
</details>
<details><summary> <code>['[(^[^01]$)]']</code> <em>(other than `[0]` and `[1]`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = ['a', 'b', 'c', 'd'];
objectScan(['[(^[^01]$)]'], { joined: true })(haystack);
// => [ '[3]', '[2]' ]
```
</details>
<details><summary> <code>['[*]', '[!(^[01]$)]']</code> <em>(match all and exclude `[0]` and `[1]`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = ['a', 'b', 'c', 'd'];
objectScan(['[*]', '[!(^[01]$)]'], { joined: true })(haystack);
// => [ '[3]', '[2]' ]
```
</details>

### Arbitrary Depth

There are two types of arbitrary depth matching:
- `**`: Matches zero or more nestings
- `++`: Matches one or more nestings

Recursions can be combined with a regex by appending the regex.

_Examples_:
<details><summary> <code>['a.**']</code> <em>(zero or more nestings under `a`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: 0, c: 0 } };
objectScan(['a.**'], { joined: true })(haystack);
// => [ 'a.c', 'a.b', 'a' ]
```
</details>
<details><summary> <code>['a.++']</code> <em>(one or more nestings under `a`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: 0, c: 0 } };
objectScan(['a.++'], { joined: true })(haystack);
// => [ 'a.c', 'a.b' ]
```
</details>
<details><summary> <code>['**(1)']</code> <em>(all containing `1` at every level)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { 1: { 1: ['c', 'd'] }, 510: 'e', foo: { 1: 'f' } };
objectScan(['**(1)'], { joined: true })(haystack);
// => [ '510', '1.1[1]', '1.1', '1' ]
```
</details>

### Or Clause

Or Clauses are defined by using curley brackets.

Can be used with Array and Object selector.

_Examples_:
<details><summary> <code>['[{0,1}]']</code> <em>(`[0]` and `[1]`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = ['a', 'b', 'c', 'd'];
objectScan(['[{0,1}]'], { joined: true })(haystack);
// => [ '[1]', '[0]' ]
```
</details>
<details><summary> <code>['{a,d}.{b,f}']</code> <em>(`a.b`, `a.f`, `d.b` and `d.f`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: 0, c: 1 }, d: { e: 2, f: 3 } };
objectScan(['{a,d}.{b,f}'], { joined: true })(haystack);
// => [ 'd.f', 'a.b' ]
```
</details>

### Exclusion

To exclude a path, use exclamation mark.

_Examples_:
<details><summary> <code>['{a,b},!a']</code> <em>(only `b`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: 1 };
objectScan(['{a,b},!a'], {
  joined: true,
  strict: false
})(haystack);
// => [ 'b' ]
```
</details>
<details><summary> <code>['**,!**.a']</code> <em>(all except ending in `a`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: { a: 1, c: 2 } };
objectScan(['**,!**.a'], { joined: true })(haystack);
// => [ 'b.c', 'b' ]
```
</details>

### Escaping

The following characters are considered special and need to
be escaped using `\`, if they should be matched in a key:<br>
`[`, `]`, `{`, `}`, `(`, `)`, `,`, `.`, `!`, `?`, `*`, `+` and `\`.

_Examples:_
<details><summary> <code>['\\[1\\]']</code> <em>(special object key)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { '[1]': 0 };
objectScan(['\\[1\\]'], { joined: true })(haystack);
// => [ '\\[1\\]' ]
```
</details>

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

This method is conceptually similar to
[Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

_Examples_:
<details><summary> <code>['**']</code> <em>(filter function)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: 'bar' };
objectScan(['**'], {
  joined: true,
  filterFn: ({ value }) => typeof value === 'string'
})(haystack);
// => [ 'b' ]
```
</details>

#### breakFn

Type: `function`<br>
Default: `undefined`

When defined, this callback is invoked for every key that is traversed by
the search. If `true` is returned, all keys nested under the current key are
skipped in the search and from the final result.

Note that `breakFn` is invoked before the corresponding `filterFn` might be invoked.

_Examples_:
<details><summary> <code>['**']</code> <em>(break function)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0 } } };
objectScan(['**'], {
  joined: true,
  breakFn: ({ key }) => key === 'a.b'
})(haystack);
// => [ 'a.b', 'a' ]
```
</details>

#### beforeFn

Type: `function`<br>
Default: `undefined`

When defined, this function is called before traversal as `beforeFn(state = { haystack, context })`
and `state.haystack` is then traversed using `state.context`.

_Examples_:
<details><summary> <code>['**']</code> <em>(combining haystack and context)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0 };
objectScan(['**'], {
  joined: true,
  beforeFn: (state) => { /* eslint-disable no-param-reassign */ state.haystack = [state.haystack, state.context]; },
  rtn: 'key'
})(haystack, { b: 0 });
// => [ '[1].b', '[1]', '[0].a', '[0]' ]
```
</details>

#### afterFn

Type: `function`<br>
Default: `undefined`

When defined, this function is called after traversal as `afterFn(state = { result, haystack, context })`
and `state.result` is then returned from the search invocation.

_Examples_:
<details><summary> <code>['**']</code> <em>(returning count plus context)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0 };
objectScan(['**'], {
  afterFn: (state) => { /* eslint-disable no-param-reassign */ state.result += state.context; },
  rtn: 'count'
})(haystack, 5);
// => 6
```
</details>

#### compareFn

Type: `function`<br>
Default: `undefined`

This function has the same signature as the callback functions. When defined it is expected to return a `function` or `undefined`.

The returned value is used as a comparator to determine the traversal order of any `object` keys.

This works together with the `reverse` option.

_Examples_:
<details><summary> <code>['**']</code> <em>(simple sort)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, c: 1, b: 2 };
objectScan(['**'], {
  joined: true,
  compareFn: () => (k1, k2) => k1.localeCompare(k2),
  reverse: false
})(haystack);
// => [ 'a', 'b', 'c' ]
```
</details>

#### reverse

Type: `boolean`<br>
Default: `true`

When set to `true`, the scan is performed in reverse order. This means `breakFn` is executed in _reverse post-order_ and
`filterFn` in _reverse pre-order_. Otherwise `breakFn` is executed in _pre-order_ and `filterFn` in _post-order_.

When `reverse` is `true` the scan is _delete-safe_. I.e. `property` can be deleted / spliced from `parent` object / array in `filterFn`.

_Examples_:
<details><summary> <code>['**']</code> <em>(breakFn, reverse true)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { f: { b: { a: {}, d: { c: {}, e: {} } }, g: { i: { h: {} } } } };
objectScan(['**'], {
  breakFn: ({ isMatch, property, context }) => { if (isMatch) { context.push(property); } },
  reverse: true
})(haystack, []);
// => [ 'f', 'g', 'i', 'h', 'b', 'd', 'e', 'c', 'a' ]
```
</details>
<details><summary> <code>['**']</code> <em>(filterFn, reverse true)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { f: { b: { a: {}, d: { c: {}, e: {} } }, g: { i: { h: {} } } } };
objectScan(['**'], {
  filterFn: ({ property, context }) => { context.push(property); },
  reverse: true
})(haystack, []);
// => [ 'h', 'i', 'g', 'e', 'c', 'd', 'a', 'b', 'f' ]
```
</details>
<details><summary> <code>['**']</code> <em>(breakFn, reverse false)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { f: { b: { a: {}, d: { c: {}, e: {} } }, g: { i: { h: {} } } } };
objectScan(['**'], {
  breakFn: ({ isMatch, property, context }) => { if (isMatch) { context.push(property); } },
  reverse: false
})(haystack, []);
// => [ 'f', 'b', 'a', 'd', 'c', 'e', 'g', 'i', 'h' ]
```
</details>
<details><summary> <code>['**']</code> <em>(filterFn, reverse false)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { f: { b: { a: {}, d: { c: {}, e: {} } }, g: { i: { h: {} } } } };
objectScan(['**'], {
  filterFn: ({ property, context }) => { context.push(property); },
  reverse: false
})(haystack, []);
// => [ 'a', 'c', 'e', 'd', 'b', 'h', 'i', 'g', 'f' ]
```
</details>

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
<details><summary> <code>['c', 'a', 'b']</code> <em>(order by needle)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: 1, c: 1 };
objectScan(['c', 'a', 'b'], {
  joined: true,
  orderByNeedles: true
})(haystack);
// => [ 'c', 'a', 'b' ]
```
</details>
<details><summary> <code>['b', '*']</code> <em>(fallback reverse)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: 1, c: 1 };
objectScan(['b', '*'], {
  joined: true,
  reverse: true,
  orderByNeedles: true
})(haystack);
// => [ 'b', 'c', 'a' ]
```
</details>
<details><summary> <code>['b', '*']</code> <em>(fallback not reverse)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: 1, c: 1 };
objectScan(['b', '*'], {
  joined: true,
  reverse: false,
  orderByNeedles: true
})(haystack);
// => [ 'b', 'a', 'c' ]
```
</details>
<details><summary> <code>['a', 'b.c', 'd']</code> <em>(nested match)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: { c: 1 }, d: 2 };
objectScan(['a', 'b.c', 'd'], {
  joined: true,
  orderByNeedles: true
})(haystack);
// => [ 'a', 'b.c', 'd' ]
```
</details>
<details><summary> <code>['b', 'a', 'b.c', 'd']</code> <em>(matches traverse first)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: { c: 1 }, d: 2 };
objectScan(['b', 'a', 'b.c', 'd'], {
  joined: true,
  orderByNeedles: true
})(haystack);
// => [ 'b.c', 'b', 'a', 'd' ]
```
</details>

#### abort

Type: `boolean`<br>
Default: `false`

When set to `true` the scan immediately returns after the first match.

_Examples_:
<details><summary> <code>['a', 'b']</code> <em>(only return first property)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: 1 };
objectScan(['a', 'b'], {
  rtn: 'property',
  abort: true
})(haystack);
// => 'b'
```
</details>
<details><summary> <code>['[0]', '[1]']</code> <em>(abort changes count)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = ['a', 'b'];
objectScan(['[0]', '[1]'], {
  rtn: 'count',
  abort: true
})(haystack);
// => 1
```
</details>

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

When set to `array`, can contain any of the above except `context`, `bool` and `count`.

When set to `function`, called with _callback_ signature for every match. Returned value is added to the result.

When **abort** is set to `true` and _rtn_ is not `context`, `bool` or `count`,
the first entry of the result or _undefined_ is returned.

_Examples_:
<details><summary> <code>['[*]']</code> <em>(return values)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = ['a', 'b', 'c'];
objectScan(['[*]'], { rtn: 'value' })(haystack);
// => [ 'c', 'b', 'a' ]
```
</details>
<details><summary> <code>['foo[*]']</code> <em>(return entries)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { foo: ['bar'] };
objectScan(['foo[*]'], { rtn: 'entry' })(haystack);
// => [ [ [ 'foo', 0 ], 'bar' ] ]
```
</details>
<details><summary> <code>['a.b.c', 'a']</code> <em>(return properties)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0 } } };
objectScan(['a.b.c', 'a'], { rtn: 'property' })(haystack);
// => [ 'c', 'a' ]
```
</details>
<details><summary> <code>['a.b', 'a.c']</code> <em>(checks for any match, full scan)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: 0, c: 1 } };
objectScan(['a.b', 'a.c'], { rtn: 'bool' })(haystack);
// => true
```
</details>
<details><summary> <code>['**']</code> <em>(return not provided context)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0 };
objectScan(['**'], { rtn: 'context' })(haystack);
// => undefined
```
</details>
<details><summary> <code>['a.b.{c,d}']</code> <em>(return keys with context passed)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0, d: 1 } } };
objectScan(['a.b.{c,d}'], { rtn: 'key' })(haystack, []);
// => [ [ 'a', 'b', 'd' ], [ 'a', 'b', 'c' ] ]
```
</details>
<details><summary> <code>['a.b.{c,d}']</code> <em>(return custom array)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0, d: 1 } } };
objectScan(['a.b.{c,d}'], { rtn: ['property', 'value'] })(haystack, []);
// => [ [ 'd', 1 ], [ 'c', 0 ] ]
```
</details>
<details><summary> <code>['**']</code> <em>(return value plus one)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0, d: 1 } } };
objectScan(['**'], {
  filterFn: ({ isLeaf }) => isLeaf,
  rtn: ({ value }) => value + 1
})(haystack);
// => [ 2, 1 ]
```
</details>

#### joined

Type: `boolean`<br>
Default: `false`

Keys are returned as a string when set to `true` instead of as a list.

Setting this option to `true` will negatively impact performance.

Note that [_.get](https://lodash.com/docs/#get) and [_.set](https://lodash.com/docs/#set) fully support lists.

_Examples_:
<details><summary> <code>['[*]', '[*].foo']</code> <em>(joined)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [0, 1, { foo: 'bar' }];
objectScan(['[*]', '[*].foo'], { joined: true })(haystack);
// => [ '[2].foo', '[2]', '[1]', '[0]' ]
```
</details>
<details><summary> <code>['[*]', '[*].foo']</code> <em>(not joined)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [0, 1, { foo: 'bar' }];
objectScan(['[*]', '[*].foo'])(haystack);
// => [ [ 2, 'foo' ], [ 2 ], [ 1 ], [ 0 ] ]
```
</details>

#### useArraySelector

Type: `boolean`<br>
Default: `true`

When set to `false`, no array selectors should be used in any needles and arrays are automatically traversed.

Note that the results still include the array selectors.

_Examples_:
<details><summary> <code>['a', 'b.d']</code> <em>(automatic array traversal)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [{ a: 0 }, { b: [{ c: 1 }, { d: 2 }] }];
objectScan(['a', 'b.d'], {
  joined: true,
  useArraySelector: false
})(haystack);
// => [ '[1].b[1].d', '[0].a' ]
```
</details>
<details><summary> <code>['']</code> <em>(top level array matching)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [{ a: 0 }, { b: 1 }];
objectScan([''], {
  joined: true,
  useArraySelector: false
})(haystack);
// => [ '[1]', '[0]' ]
```
</details>

#### strict

Type: `boolean`<br>
Default: `true`

When set to `true`, errors are thrown when:
- a path is identical to a previous path
- a path invalidates a previous path
- a path contains consecutive recursions

_Examples_:
<details><summary> <code>['a.b', 'a.b']</code> <em>(identical)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [];
objectScan(['a.b', 'a.b'], { joined: true })(haystack);
// => 'Error: Redundant Needle Target: "a.b" vs "a.b"'
```
</details>
<details><summary> <code>['a.{b,b}']</code> <em>(identical, same needle)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [];
objectScan(['a.{b,b}'], { joined: true })(haystack);
// => 'Error: Redundant Needle Target: "a.{b,b}" vs "a.{b,b}"'
```
</details>
<details><summary> <code>['a.b', 'a.**']</code> <em>(invalidates previous)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [];
objectScan(['a.b', 'a.**'], { joined: true })(haystack);
// => 'Error: Needle Target Invalidated: "a.b" by "a.**"'
```
</details>
<details><summary> <code>['**.!**']</code> <em>(consecutive recursion)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [];
objectScan(['**.!**'], { joined: true })(haystack);
// => 'Error: Redundant Recursion: "**.!**"'
```
</details>

### Search Context

A context can be passed into a search invocation as a second parameter. It is available in all callbacks
and can be used to manage state across a search invocation without having to recompile the search.

By default all matched keys are returned from a search invocation.
However, when it is not _undefined_, the context is returned instead.

_Examples_:
<details><summary> <code>['**.{c,d,e}']</code> <em>(sum values)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 2, d: 11 }, e: 7 } };
objectScan(['**.{c,d,e}'], {
  joined: true,
  filterFn: ({ value, context }) => { context.sum += value; }
})(haystack, { sum: 0 });
// => { sum: 20 }
```
</details>

## Examples

More extensive examples can be found in the tests.

<details><summary> <code>['a.*.f']</code> <em>(nested)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['a.*.f'], { joined: true })(haystack);
// => [ 'a.e.f' ]
```
</details>

<details><summary> <code>['*.*.*']</code> <em>(multiple nested)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['*.*.*'], { joined: true })(haystack);
// => [ 'a.e.f', 'a.b.c' ]
```
</details>

<details><summary> <code>['a.*.{c,f}']</code> <em>(or filter)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['a.*.{c,f}'], { joined: true })(haystack);
// => [ 'a.e.f', 'a.b.c' ]
```
</details>

<details><summary> <code>['a.*.{c,f}']</code> <em>(or filter, not joined)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['a.*.{c,f}'])(haystack);
// => [ [ 'a', 'e', 'f' ], [ 'a', 'b', 'c' ] ]
```
</details>

<details><summary> <code>['*.*[*]']</code> <em>(list filter)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['*.*[*]'], { joined: true })(haystack);
// => [ 'a.h[1]', 'a.h[0]' ]
```
</details>

<details><summary> <code>['*[*]']</code> <em>(list filter, unmatched)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['*[*]'], { joined: true })(haystack);
// => []
```
</details>

<details><summary> <code>['**']</code> <em>(star recursion)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['**'], { joined: true })(haystack);
// => [ 'k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b.c', 'a.b', 'a' ]
```
</details>

<details><summary> <code>['++.++']</code> <em>(plus recursion)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['++.++'], { joined: true })(haystack);
// => [ 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b.c', 'a.b' ]
```
</details>

<details><summary> <code>['**.f']</code> <em>(star recursion ending in f)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['**.f'], { joined: true })(haystack);
// => [ 'a.e.f' ]
```
</details>

<details><summary> <code>['**[*]']</code> <em>(star recursion ending in array)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['**[*]'], { joined: true })(haystack);
// => [ 'a.h[1]', 'a.h[0]' ]
```
</details>

<details><summary> <code>['a.*,!a.e']</code> <em>(exclusion filter)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['a.*,!a.e'], { joined: true })(haystack);
// => [ 'a.h', 'a.b' ]
```
</details>

<details><summary> <code>['**.(^[bc]$)']</code> <em>(regex matching)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['**.(^[bc]$)'], { joined: true })(haystack);
// => [ 'a.b.c', 'a.b' ]
```
</details>

## Edge Cases

Top level object(s) are matched by the empty needle `''`. This is useful for matching objects nested in arrays by setting `useArraySelector` to `false`.
To match the actual empty string as a key, use `(^$)`.

Note that the empty string does not work to match top level objects with
[_.get](https://lodash.com/docs/#get) or [_.set](https://lodash.com/docs/#set).

_Examples_:
<details><summary> <code>['']</code> <em>(match top level objects in array)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [{}, {}];
objectScan([''], {
  joined: true,
  useArraySelector: false
})(haystack);
// => [ '[1]', '[0]' ]
```
</details>
<details><summary> <code>['']</code> <em>(match top level object)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = {};
objectScan([''], { joined: true })(haystack);
// => [ '' ]
```
</details>
<details><summary> <code>['**.(^$)']</code> <em>(match empty string keys)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { '': 0, a: { '': 1 } };
objectScan(['**.(^$)'])(haystack);
// => [ [ 'a', '' ], [ '' ] ]
```
</details>
<details><summary> <code>['**(^a$)']</code> <em>(star recursion matches roots)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [0, [{ a: 1 }, 2]];
objectScan(['**(^a$)'], {
  joined: true,
  useArraySelector: false
})(haystack);
// => [ '[1][1]', '[1][0].a', '[1][0]', '[0]' ]
```
</details>

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
