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

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

objectScan(['a.*.f'])({ a: { b: { c: 'd' }, e: { f: 'g' } } });
// => [ 'a.e.f' ]
```

### Features

- Input traversed exactly once during search
- Dependency free, small in size and very performant
- Object and Array matching with e.g. `key.path` and `[1]`
- Wildcard matching with `*` and `[*]`
- Partial Wildcard matching with e.g. `mark*`, `m?rk`, `[*1]` or `[?1]`
- Regex matching with e.g. `(^fo+b)` or `[(^\[2\]$)]`
- Arbitrary depth matching with `**`, and with regex `**(^fo+b)` or `**(^\[2\]$)`
- Or-clause with e.g. `{a,b}` and `[{0,1}]`
- Exclusion with e.g. `!key`
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

## Examples

More extensive examples can be found in the tests.

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const obj = {
  a: {
    b: {
      c: 'd'
    },
    e: {
      f: 'g'
    },
    h: ['i', 'j']
  },
  k: 'l'
};

// top level keys
objectScan(['*'], { joined: true })(obj);
// => ["k", "a"]

// nested keys
objectScan(['a.*.f'], { joined: true })(obj);
// => ["a.e.f"]
objectScan(['*.*.*'], { joined: true })(obj);
// => ["a.e.f", "a.b.c"]

// or filter
objectScan(['a.*.{c,f}'], { joined: true })(obj);
// => ["a.e.f", "a.b.c"]
objectScan(['a.*.{c,f}'])(obj);
// => [["a", "e", "f"], ["a", "b", "c"]]

// list filter
objectScan(['*.*[*]'], { joined: true })(obj);
// => ["a.h[1]", "a.h[0]"]
objectScan(['*[*]'], { joined: true })(obj);
// => []

// deep star filter
objectScan(['**'], { joined: true })(obj);
// => ["k", "a.h[1]", "a.h[0]", "a.h", "a.e.f", "a.e", "a.b.c", "a.b", "a"]
objectScan(['**.f'], { joined: true })(obj);
// => ["a.e.f"]
objectScan(['**[*]'], { joined: true })(obj);
// => ["a.h[1]", "a.h[0]"]

// exclusion filter
objectScan(['a.*,!a.e'], { joined: true })(obj);
// => ["a.h", "a.b"]

// regex matching
objectScan(['**.(^[bc]$)'], { joined: true })(obj);
// => ["a.b.c", "a.b"]

// value function
objectScan(['**'], { filterFn: ({ value }) => typeof value === 'string', joined: true })(obj);
// => ["k", "a.h[1]", "a.h[0]", "a.e.f", "a.b.c"]
objectScan(['**'], { breakFn: ({ key }) => key === 'a.b', joined: true })(obj);
// => ["k", "a.h[1]", "a.h[0]", "a.h", "a.e.f", "a.e", "a.b", "a"]
```

## Edge Cases

The top level object(s) are matched by the empty needle `""`.
Useful for matching objects nested in arrays by setting `useArraySelector` to `false`.
Note that the empty string does not work with [_.get](https://lodash.com/docs/#get) and [_.set](https://lodash.com/docs/#set).

## Special Characters

The following characters are considered special and need to
be escaped if they should be matched in a key: `[`, `]`, `{`, `}`, `(`, `)`, `,`, `.`, `!`, `?`, `*` and `\`.

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
