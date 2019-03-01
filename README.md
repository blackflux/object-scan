# Object-Scan

[![Build Status](https://circleci.com/gh/blackflux/object-scan.png?style=shield)](https://circleci.com/gh/blackflux/object-scan)
[![Test Coverage](https://img.shields.io/coveralls/blackflux/object-scan/master.svg)](https://coveralls.io/github/blackflux/object-scan?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=blackflux/object-scan)](https://dependabot.com)
[![Dependencies](https://david-dm.org/blackflux/object-scan/status.svg)](https://david-dm.org/blackflux/object-scan)
[![NPM](https://img.shields.io/npm/v/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Downloads](https://img.shields.io/npm/dt/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Semantic-Release](https://github.com/blackflux/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)
[![Gitter](https://github.com/blackflux/js-gardener/blob/master/assets/icons/gitter.svg)](https://gitter.im/blackflux/object-scan)

Find keys in object hierarchies using wildcard matching and callbacks.

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

- Object and Array matching with e.g. `key.path` and `[1]`
- Wildcard matching with `*` and `[*]`
- Partial Wildcard matching with e.g. `mark*` or `[1*]`
- Arbitrary depth matching with `**`
- Simple or-clause with e.g. `{a,b}` and `[{0,1}]`
- Full support for escaping
- Input traversed exactly once during search
- Matches returned in "delete-safe" order
- Dependency free, small in size and very performant
- Lots of tests to ensure correctness

### Options

**Note on Functions:** Signature for all functions is `Fn(key, value, { parents, isMatch, matchedBy, traversedBy })`, where:
- `key` is the key that the function is called for (respects `joined` option).
- `value` is the value for that key.
- `parents` is an array containing all parents as `[parent, grandparent, ...]`. Excludes arrays if `useArraySelector` is false.
- `isMatch` is true if exactly matched by at least one needle.
- `matchedBy` are all needles matching the key exactly.
- `traversedBy` are all needles involved in traversing the key.

#### filterFn

Type: `function`<br>
Default: `undefined`

If function is defined, it is called for every exact match. If `false`
is returned, the current key is excluded from the result.

This method is conceptually similar to the callback function in
[Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

#### breakFn

Type: `function`<br>
Default: `undefined`

If function is defined, it is called for every key that is traversed by
the search. If `true` is returned, all keys nested under the current key are
skipped in the search and from the final result.

Note that `breakFn` is called before the corresponding `filterFn` might be called.

#### joined

Type: `boolean`<br>
Default: `true`

Can be set to false to return each key as a list. When dealing with _special characters_ this can be useful.

Setting this to `false` improves performance.

Note that [_.get](https://lodash.com/docs/#get) and [_.set](https://lodash.com/docs/#set) fully support lists.

#### escapePaths

Type: `boolean`<br>
Default: `true`

When set to false, joined paths for functions and the final result are not escaped.

#### useArraySelector

Type: `boolean`<br>
Default: `true`

When set to false, no array selectors should be used in any needles and arrays are automatically traversed.

Note that the results still include the array selectors.

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
objectScan(['*'])(obj);
// => ["k", "a"]

// nested keys
objectScan(['a.*.f'])(obj);
// => ["a.e.f"]
objectScan(['*.*.*'])(obj);
// => ["a.e.f", "a.b.c"]

// or filter
objectScan(['a.*.{c,f}'])(obj);
// => ["a.e.f", "a.b.c"]
objectScan(['a.*.{c,f}'], { joined: false })(obj);
// => [["a", "e", "f"], ["a", "b", "c"]]

// list filter
objectScan(['*.*[*]'])(obj);
// => ["a.h[1]", "a.h[0]"]
objectScan(['*[*]'])(obj);
// => []

// deep star filter
objectScan(['**'])(obj);
// => ["k", "a.h[1]", "a.h[0]", "a.h", "a.e.f", "a.e", "a.b.c", "a.b", "a"]
objectScan(['**.f'])(obj);
// => ["a.e.f"]
objectScan(['**[*]'])(obj);
// => ["a.h[1]", "a.h[0]"]

// value function
objectScan(['**'], { filterFn: (key, value) => typeof value === 'string' })(obj);
// => ["k", "a.h[1]", "a.h[0]", "a.e.f", "a.b.c"]
objectScan(['**'], { breakFn: key => key === 'a.b' })(obj);
// => ["k", "a.h[1]", "a.h[0]", "a.h", "a.e.f", "a.e", "a.b", "a"]
```

## Edge Cases

The top level object(s) are matched by the empty needle `""`. 
Useful for matching objects nested in arrays by setting `useArraySelector` to `false`.
Note that the empty string does not work with [_.get](https://lodash.com/docs/#get) and [_.set](https://lodash.com/docs/#set).

## Special Characters

The following Characters are considered special and need to 
be escaped if they should be matched in a key: `[`, `]`, `{`, `}`, `,`, `.` and `*`. 

When dealing with special characters, it might be desirable to set the  `joined` option to `false`.

## Internals

Conceptually this package works as follows:
 
(1) During initialization the needles are parsed and build into a search tree. 
Various information is pre-computed and stored for every node.
Finally the search function is returned.

(2) When the search function is called, the input is traversed simultaneously with 
the relevant nodes of the search tree. Processing multiple search tree branches
in parallel allows for a single traversal of the input.
