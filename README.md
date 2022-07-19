# Object-Scan

[![Build Status](https://circleci.com/gh/blackflux/object-scan.png?style=shield)](https://circleci.com/gh/blackflux/object-scan)
[![NPM](https://img.shields.io/npm/v/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Downloads](https://img.shields.io/npm/dt/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Size](https://shields.io/badge/minified-14.69%20KB-informational)](https://cdn.jsdelivr.net/npm/object-scan/lib/)

Traverse object hierarchies using matching and callbacks.

## Install

Using npm:

    $ npm i object-scan

In a browser:

```html
<script type="module">
  import objectScan from 'https://cdn.jsdelivr.net/npm/object-scan@<VERSION>/lib/index.min.js';
  // do logic here
</script>
```

## Usage

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
import objectScan from 'object-scan';

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' } } };
objectScan(['a.*.f'], { joined: true })(haystack);
// => [ 'a.e.f' ]
```


## Features

- Input [traversed](#traversal_order) at most once during search
- Dependency free and [tiny bundle size](https://cdn.jsdelivr.net/npm/object-scan/lib/)
- Powerful [matching syntax](#matching)
- Very [performant](#jsonpath)
- Extensive [tests](./test) and lots of [examples](#real_world_uses)

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

<a id="object"></a>
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

<a id="wildcard"></a>
### Wildcard

The following characters have special meaning when not escaped:
- `*`: Match zero or more character
- `+`: Match one or more character
- `?`: Match exactly one character
- `\`: Escape the subsequent character

Can be used with [Array](#array) and [Object](#object) selector.

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

<a id="regex"></a>
### Regex

Regex are defined by using parentheses.

Can be used with [Array](#array) and [Object](#object) selector.

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

<a id="or_clause"></a>
### Or Clause

Or Clauses are defined by using curley brackets.

Can be used with [Array](#array) and [Object](#object) selector
and [Arbitrary Depth](#arbitrary_depth) matching.

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

<a id="arbitrary_depth"></a>
### Arbitrary Depth

There are two types of arbitrary depth matching:
- `**`: Matches zero or more nestings
- `++`: Matches one or more nestings

Can be combined with [Regex](#regex) and [Or Clause](#or_clause) by prepending.

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

<a id="nested_path_recursion"></a>
### Nested Path Recursion

To match a nested path recursively,
combine [Arbitrary Depth](#arbitrary_depth) matching with an [Or Clause](#or_clause).

There are two types of nested path matching:
- `**{...}`: Matches path(s) in [Or Clause](#or_clause) zero or more times
- `++{...}`: Matches path(s) in [Or Clause](#or_clause) one or more times

_Examples_:
<details><summary> <code>['++{[0][1]}']</code> <em>(`cyclic path`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [[[[0, 1], [1, 2]], [[3, 4], [5, 6]]], [[[7, 8], [9, 10]], [[11, 12], [13, 14]]]];
objectScan(['++{[0][1]}'], { joined: true })(haystack);
// => [ '[0][1][0][1]', '[0][1]' ]
```
</details>
<details><summary> <code>['++{[0],[1]}']</code> <em>(`nested or`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
objectScan(['++{[0],[1]}'], { joined: true })(haystack);
// => [ '[1][1]', '[1][0]', '[1]', '[0][1]', '[0][0]', '[0]' ]
```
</details>
<details><summary> <code>['**{[*]}']</code> <em>(`traverse only array`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [[[{ a: [1] }], [2]]];
objectScan(['**{[*]}'], { joined: true })(haystack);
// => [ '[0][1][0]', '[0][1]', '[0][0][0]', '[0][0]', '[0]' ]
```
</details>
<details><summary> <code>['**{*}']</code> <em>(`traverse only object`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: [0, { b: 1 }], c: { d: 2 } };
objectScan(['**{*}'], { joined: true })(haystack);
// => [ 'c.d', 'c', 'a' ]
```
</details>
<details><summary> <code>['a.**{b.c}']</code> <em>(`zero or more times`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: { b: { c: 0 } } } } };
objectScan(['a.**{b.c}'], { joined: true })(haystack);
// => [ 'a.b.c.b.c', 'a.b.c', 'a' ]
```
</details>
<details><summary> <code>['a.++{b.c}']</code> <em>(`one or more times`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: { b: { c: 0 } } } } };
objectScan(['a.++{b.c}'], { joined: true })(haystack);
// => [ 'a.b.c.b.c', 'a.b.c' ]
```
</details>

<a id="exclusion"></a>
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

<a id="escaping"></a>
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

<a id="callbacks"></a>
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

For more information on invocation order, please refer to Section [Traversal Order](#traversal_order).

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

For more information on invocation order, please refer to Section [Traversal Order](#traversal_order).

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

When defined, this function is called before traversal as `beforeFn(state = { haystack, context })`.

If a value other than `undefined` is returned from `beforeFn`,
that value is written to `state.haystack` before traversal.

The content of `state` can be modified in the function.
After `beforeFn` has executed, the traversal happens using `state.haystack` and `state.context`.

The content in `state` can be accessed in `afterFn`.
Note however that the key `result` is being overwritten.

_Examples_:
<details><summary> <code>['**']</code> <em>(combining haystack and context)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0 };
objectScan(['**'], {
  joined: true,
  beforeFn: ({ haystack: h, context: c }) => [h, c],
  rtn: 'key'
})(haystack, { b: 0 });
// => [ '[1].b', '[1]', '[0].a', '[0]' ]
```
</details>
<details><summary> <code>['**']</code> <em>(pre-processing haystack)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: 1 };
objectScan(['**'], {
  joined: true,
  beforeFn: ({ haystack: h }) => Object.keys(h),
  rtn: ['key', 'value']
})(haystack);
// => [ [ '[1]', 'b' ], [ '[0]', 'a' ] ]
```
</details>

#### afterFn

Type: `function`<br>
Default: `undefined`

When defined, this function is called after traversal as `afterFn(state = { result, haystack, context })`.

Additional information written to `state` in `beforeFn` is available in `afterFn`.

The content of `state` can be modified in the function. In particular the key `state.result` can be updated.

If a value other than `undefined` is returned from `afterFn`, that value is written to `state.result`.

After `beforeFn` has executed, the key `state.result` is returned as the final result.

_Examples_:
<details><summary> <code>['**']</code> <em>(returning count plus context)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0 };
objectScan(['**'], {
  afterFn: ({ result, context }) => result + context,
  rtn: 'count'
})(haystack, 5);
// => 6
```
</details>
<details><summary> <code>['**']</code> <em>(post-processing result)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: 3, c: 4 };
objectScan(['**'], {
  afterFn: ({ result }) => result.filter((v) => v > 3),
  rtn: 'value'
})(haystack);
// => [ 4 ]
```
</details>
<details><summary> <code>['**']</code> <em>(pass data from beforeFn to afterFn)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = {};
objectScan(['**'], {
  beforeFn: (state) => { /* eslint-disable no-param-reassign */ state.custom = 7; },
  afterFn: (state) => state.custom
})(haystack);
// => 7
```
</details>

#### compareFn

Type: `function`<br>
Default: `undefined`

This function has the same signature as the callback functions. When defined it is expected to return a `function` or `undefined`.

The returned value is used as a comparator to determine the traversal order of any `object` keys.

This works together with the `reverse` option.

Please refer to Section [Traversal Order](#traversal_order) for more information.

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

When set to `true`, the traversal is performed in reverse order. This means `breakFn` is executed in _reverse post-order_ and
`filterFn` in _reverse pre-order_. Otherwise `breakFn` is executed in _pre-order_ and `filterFn` in _post-order_.

When `reverse` is `true` the traversal is _delete-safe_. I.e. `property` can be deleted / spliced from `parent` object / array in `filterFn`.

Please refer to Section [Traversal Order](#traversal_order) for more information.

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

When set to `true` the traversal immediately returns after the first match.

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
- `sum`: returns the match sum

When set to `array`, can contain any of the above except `context`, `bool`, `count` and `sum`.

When set to `function`, called with _callback_ signature for every match. Returned value is added to the result.

When **abort** is set to `true` and _rtn_ is not `context`, `bool`, `count` or `sum`,
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
<details><summary> <code>['a.b', 'a.c']</code> <em>(checks for any match, full traversal)</em> </summary>

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
<details><summary> <code>['**']</code> <em>(return sum)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: -2, d: 1 }, e: [3, 7] } };
objectScan(['**'], {
  filterFn: ({ value }) => typeof value === 'number',
  rtn: 'sum'
})(haystack);
// => 9
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

<a id="traversal_order"></a>
## Traversal Order

The [traversal order](https://en.wikipedia.org/wiki/Tree_traversal) is always depth first.
However, the order the nodes are traversed in can be changed.

<details><summary> <code>['**']</code> <em>(Reverse Pre-order)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { F: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } } };
objectScan(['**'], {
  filterFn: ({ context, property }) => { context.push(property); }
})(haystack, []);
// => [ 'H', 'I', 'G', 'E', 'C', 'D', 'A', 'B', 'F' ]
```
</details>

<details><summary> <code>['**']</code> <em>(Reverse Post-order)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { F: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } } };
objectScan(['**'], {
  breakFn: ({ context, property }) => { context.push(property); }
})(haystack, []);
// => [ undefined, 'F', 'G', 'I', 'H', 'B', 'D', 'E', 'C', 'A' ]
```
</details>

<details><summary> <code>['**']</code> <em>(Post-order)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { F: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } } };
objectScan(['**'], {
  filterFn: ({ context, property }) => { context.push(property); },
  reverse: false
})(haystack, []);
// => [ 'A', 'C', 'E', 'D', 'B', 'H', 'I', 'G', 'F' ]
```
</details>

<details><summary> <code>['**']</code> <em>(Pre-order)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { F: { B: { A: 0, D: { C: 1, E: 2 } }, G: { I: { H: 3 } } } };
objectScan(['**'], {
  breakFn: ({ context, property }) => { context.push(property); },
  reverse: false
})(haystack, []);
// => [ undefined, 'F', 'B', 'A', 'D', 'C', 'E', 'G', 'I', 'H' ]
```
</details>

Note that the default traversal order is _delete-safe_. This means that elements from
Arrays can be deleted without impacting the traversal.

<details><summary> <code>['**']</code> <em>(Deleting from Array)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [0, 1, 2, 3, 4, 5];
objectScan(['**'], {
  filterFn: ({ parent, property }) => { parent.splice(property, property % 2); },
  afterFn: ({ haystack: h }) => h
})(haystack);
// => [ 0, 2, 4 ]
```
</details>

This is not true when the `reverse` option is set to `false`

<details><summary> <code>['**']</code> <em>(Deleting from Array Unexpected)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [0, 1, 2, 3, 4, 5];
objectScan(['**'], {
  filterFn: ({ parent, property }) => { parent.splice(property, property % 2); },
  afterFn: ({ haystack: h }) => h,
  reverse: false
})(haystack);
// => [ 0, 2, 3, 5 ]
```
</details>

By default, the traversal order depends on the haystack _input order_ and the `reverse` option for the direction.
However, this _input order_ can be altered by using `compareFn` and `orderByNeedles`.

<details><summary> <code>['c', 'b', 'a']</code> <em>(orderByNeedles)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { b: 0, a: 1, c: 2 };
objectScan(['c', 'b', 'a'], {
  filterFn: ({ context, property }) => { context.push(property); },
  orderByNeedles: true
})(haystack, []);
// => [ 'c', 'b', 'a' ]
```
</details>

<details><summary> <code>['**']</code> <em>(compareFn)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { b: 0, a: 1, c: 2 };
objectScan(['**'], {
  filterFn: ({ context, property }) => { context.push(property); },
  compareFn: () => (a, b) => b.localeCompare(a)
})(haystack, []);
// => [ 'a', 'b', 'c' ]
```
</details>

Note that `compareFn` does not work on Arrays.

Both options can be combined, in which case `orderByNeedles` supersedes `compareFn`

<details><summary> <code>['c', '*']</code> <em>(orderByNeedles and compareFn)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: 1, c: 2 };
objectScan(['c', '*'], {
  filterFn: ({ context, property }) => { context.push(property); },
  compareFn: () => (a, b) => b.localeCompare(a),
  orderByNeedles: true
})(haystack, []);
// => [ 'c', 'a', 'b' ]
```
</details>

<a id="jsonpath"></a>
## JSONPath and others

While this library has a similar syntax and can perform similar tasks
to [jsonpath](https://www.npmjs.com/package/jsonpath) or [jmespath](https://www.npmjs.com/package/jmespath),
instead of querying an object hierarchy, it focuses on traversing it.
This means there are some significant differences.

Performance is comparable or better than other libraries, where functionality intersects.
However, a one to one comparison is not possible due to difference in functionality.
In general `object-scan` is more versatile than other similar libraries.

|_[v8 --no-opt](https://flaviocopes.com/node-runtime-v8-options/)_|objectScanCompiled|objectScan|[jsonpath](https://www.npmjs.com/package/jsonpath)|[jsonpath-plus](https://www.npmjs.com/package/jsonpath-plus)|[jmespath](https://www.npmjs.com/package/jmespath)|
|---|---|---|---|---|---|
|<a href="./test/comparison/suites/key.js">Get Key</a>|![](https://img.shields.io/badge/1.98x-4d8e1d?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/5.38x-dcaf16?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/5.81x-dca916?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|-|
|<a href="./test/comparison/suites/value.js">Get Value</a>|![](https://img.shields.io/badge/3.25x-899e1b?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/12.24x-d05710?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/26.67x-b01414?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/3.43x-92a11a?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|
|<a href="./test/comparison/suites/condition.js">Conditional Path</a>|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_1">[1]</a></sup></i>|![](https://img.shields.io/badge/3.09x-829c1b?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_1">[1]</a></sup></i>|![](https://img.shields.io/badge/6.14x-dba415?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/26.61x-b01414?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/1.44x-34871e?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|
|<a href="./test/comparison/suites/recursive.js">Recursive Traversal</a>|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_2">[2]</a></sup></i>|![](https://img.shields.io/badge/2.17x-56901d?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_2">[2]</a></sup></i>|![](https://img.shields.io/badge/1.74x-428b1e?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_3">[3]</a></sup></i>|![](https://img.shields.io/badge/1.59x-3b891e?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_3">[3]</a></sup></i>|- <i><sup><a href="#timing_ref_4">[4]</a></sup></i>|
|<a href="./test/comparison/suites/callback.js">Callback with Context</a>|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_5">[5]</a></sup></i>|![](https://img.shields.io/badge/1.91x-4a8d1d?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_5">[5]</a></sup></i>|-|![](https://img.shields.io/badge/1.11x-24821f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_6">[6]</a></sup></i>|-|
|<a href="./test/comparison/suites/parent.js">Get Parent</a>|![](https://img.shields.io/badge/1.13x-25831f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/2.35x-5f931c?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|-|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|-|
|<a href="./test/comparison/suites/multiplePaths.js">Multiple Paths</a>|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/3.93x-a9a719?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|- <i><sup><a href="#timing_ref_7">[7]</a></sup></i>|- <i><sup><a href="#timing_ref_7">[7]</a></sup></i>|![](https://img.shields.io/badge/1.16x-27831f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_8">[8]</a></sup></i>|

|_[v8 --opt](https://flaviocopes.com/node-runtime-v8-options/)_|objectScanCompiled|objectScan|[jsonpath](https://www.npmjs.com/package/jsonpath)|[jsonpath-plus](https://www.npmjs.com/package/jsonpath-plus)|[jmespath](https://www.npmjs.com/package/jmespath)|
|---|---|---|---|---|---|
|<a href="./test/comparison/suites/key.js">Get Key</a>|![](https://img.shields.io/badge/2.54x-68951c?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/4.36x-bead18?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/4.55x-c7af18?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|-|
|<a href="./test/comparison/suites/value.js">Get Value</a>|![](https://img.shields.io/badge/7.49x-db9013?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/14.77x-c54111?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/25.29x-b01414?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/1.24x-2a841f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|
|<a href="./test/comparison/suites/condition.js">Conditional Path</a>|![](https://img.shields.io/badge/3.14x-849d1b?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_1">[1]</a></sup></i>|![](https://img.shields.io/badge/5.54x-dcad16?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_1">[1]</a></sup></i>|![](https://img.shields.io/badge/6.37x-dba015?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/159.45x-b01414?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|
|<a href="./test/comparison/suites/recursive.js">Recursive Traversal</a>|![](https://img.shields.io/badge/1.29x-2d851e?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_2">[2]</a></sup></i>|![](https://img.shields.io/badge/1.72x-418a1e?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_2">[2]</a></sup></i>|![](https://img.shields.io/badge/1.39x-31861e?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_3">[3]</a></sup></i>|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_3">[3]</a></sup></i>|- <i><sup><a href="#timing_ref_4">[4]</a></sup></i>|
|<a href="./test/comparison/suites/callback.js">Callback with Context</a>|![](https://img.shields.io/badge/1.42x-33861e?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_5">[5]</a></sup></i>|![](https://img.shields.io/badge/1.89x-498d1d?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_5">[5]</a></sup></i>|-|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_6">[6]</a></sup></i>|-|
|<a href="./test/comparison/suites/parent.js">Get Parent</a>|![](https://img.shields.io/badge/1.88x-498c1d?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/2.76x-72981b?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|-|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|-|
|<a href="./test/comparison/suites/multiplePaths.js">Multiple Paths</a>|![](https://img.shields.io/badge/3.50x-95a21a?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|![](https://img.shields.io/badge/8.94x-da7a11?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC)|- <i><sup><a href="#timing_ref_7">[7]</a></sup></i>|- <i><sup><a href="#timing_ref_7">[7]</a></sup></i>|![](https://img.shields.io/badge/1.00x-1f811f?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAN5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqTW0FQAAAEl0Uk5TAAECAwUKCwwQERQWFxkbHCInKDEzNTg5PkVHSEpRU1VXWV5fb3R1eHp7fn+AhIaLjZeboaaorK2ys7fW19jZ6ery8/f4+fv9/sHJynAAAAEzSURBVDjLfZPXWsJAEEZ/VEKTIogNLCBVEaRLlxAl5/1fyAsFQ0jyX+23Z2Znp0l7RcvDpYm9nvWfsyEdKdMz2at/csQ7OPRx6sapOcB2Wivm84Xm+5F71gI2zbjruvD2d0hawDjmdruC9pkkaQY05MEhK0ltoO7NHyUpDYy8+b0kqQtWOIBH1lAN4CrB1gjgGsAkiGsBFUnKLZKeXCbcSrqBz4QXlw2Xkl6AVcLFQ4Zh7Az0CqzOde30z/Fl7kJILWDx9O18/w7s/Sd/LQ7jV2DhTLPl4prA4KBQrUNubKF0WOo2D46CVWEdcTXrwsHDFnR92y1pBKT9B0Z1oC3/kWsAM/+hjY0BK+k39vHmBrCy3otTrE23APOU/+oBdAKX1+xlPPKOlodL07bN5bAc/b/9Ady8YOUyY0aLAAAAAElFTkSuQmCC) <i><sup><a href="#timing_ref_8">[8]</a></sup></i>|

<a id="timing_ref_1"><i>[1]</i></a>:  Only in code logic<br>
<a id="timing_ref_2"><i>[2]</i></a>:  [Depth-first](https://en.wikipedia.org/wiki/Tree_traversal#Depth-first_search) traversal. See [here](#traversal_order) for details<br>
<a id="timing_ref_3"><i>[3]</i></a>:  [Custom depth-first](https://cs.stackexchange.com/questions/99440) traversal<br>
<a id="timing_ref_4"><i>[4]</i></a>: [Reference](https://github.com/jmespath/jmespath.py/issues/110)<br>
<a id="timing_ref_5"><i>[5]</i></a>: [Documentation](#callbacks)<br>
<a id="timing_ref_6"><i>[6]</i></a>: Usefulness limited since context is lacking<br>
<a id="timing_ref_7"><i>[7]</i></a>: [Reference](https://stackoverflow.com/questions/55497833/jsonpath-union-of-multiple-different-paths)<br>
<a id="timing_ref_8"><i>[8]</i></a>: Usefulness limited since no callback<br>

<a id="real_world_uses"></a>
## Real World Uses

This library was originally designed and build to power [object-rewrite](https://github.com/blackflux/object-rewrite).

Many other examples can be found on [Stack Overflow](https://stackoverflow.com/search?q=%5Bjavascript%5D+object-scan+user%3A1030413).

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

This library has been designed around performance as a core feature.

The implementation is completely recursion free. This allows
for traversal of deeply nested objects where a recursive approach
would fail with a `Maximum call stack size exceeded` error.

The search is pre-computes, which makes applying the same search multiple times very performant.

Traversal happens depth-first, which allows for lower memory consumption.

Conceptually this package works as follows:

1. During initialization the needles are parsed and built into a search tree.
Various information is pre-computed and stored for every node.
Finally the search function is returned.

2. When the search function is invoked, the input is traversed simultaneously with
the relevant nodes of the search tree. Processing multiple search tree branches
in parallel allows for a single traversal of the input.

Having a separate initialization stage allows for a performant search and
significant speed ups when applying the same search to different input.
