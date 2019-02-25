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

Find Keys using Wildcard matching and optional value function.

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

- Object and array matching with e.g. `key.path` and `[1]`
- Key and index wildcard matching with `*` and `[*]`
- Partial key and index wildcard matching, e.g. `mark*` or `[1*]`
- Infinite nested matches with `**`
- Simple or-clause for key and index with `{a,b}` and `[{0,1}]`
- Input is traversed exactly once and only unique results are returned.
- Full support for escaping
- Lots of tests to ensure correctness

### Options

**Note on Functions:** Signature for all functions is `Fn(key, value, { parents, isMatch, matches, needles })`, where:
- `key` is the key that the function is called for (respects `joined` option).
- `value` is the value of that key.
- `parents` is an array containing all parents as `[parent, grandparent, ...]`. Contains parents that are arrays only iff `useArraySelector` is true.
- `isMatch` is true if exactly matched by at least one key. Indicates valid (intermittent) result.
- `matches` are all needles matching key exactly.
- `needles` are all needles matching key (partially).

Note: `matches` and `needles` can be hard to interpret when `**` is used.

#### filterFn

Type: `function`<br>
Default: `undefined`

Called for every intermittent result. 
If function is defined and returns false, the entry is excluded from the final result.

This method is conceptually similar to [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

#### breakFn

Type: `function`<br>
Default: `undefined`

Called for every key that could be (part of) a match. If function is
defined and returns true, all nested entries under the current key are
excluded from search and from the final result.

#### callbackFn

Type: `function`<br>
Default: `undefined`

Called for every final result.

#### arrayCallbackFn

Type: `function`<br>
Default: `undefined`

Called when `useArraySelector` is `false` for every array that contains non-nested entries matched by a needle.

#### joined

Type: `boolean`<br>
Default: `true`

Can be set to false to return each key as a list. When dealing with special characters this can be useful.

Important: Setting this to `false` improves performance.

#### sorted

Type: `boolean`<br>
Default: `false`

When set to `true`, the results are ordered in a way that they can be safely deleted from the input in order.

Important: Can only be set to `true` when joined is set to `false`.

#### escapePaths

Type: `boolean`<br>
Default: `true`

When set to false, joined paths for functions and the final result are not escaped.

#### useArraySelector

Type: `boolean`<br>
Default: `true`

When set to false no array selectors are used and arrays are automatically traversed.

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
// => ["a", "k"]

// nested keys
objectScan(['a.*.f'])(obj);
// => ["a.e.f"]
objectScan(['*.*.*'])(obj);
// => ["a.b.c", "a.e.f"]

// or filter
objectScan(['a.*.{c,f}'])(obj);
// => ["a.b.c", "a.e.f"]
objectScan(['a.*.{c,f}'], { joined: false })(obj);
// => [["a", "b", "c"], ["a", "e", "f"]]

// list filter
objectScan(['*.*[*]'])(obj);
// => ["a.h[0]", "a.h[1]"]
objectScan(['*[*]'])(obj);
// => []

// deep star filter
objectScan(['**'])(obj);
// => ["a", "a.b", "a.b.c", "a.e", "a.e.f", "a.h", "a.h[0]", "a.h[1]", "k"]
objectScan(['**.f'])(obj);
// => ["a.e.f"]
objectScan(['**[*]'])(obj);
// => ["a.h[0]", "a.h[1]"]

// value function
objectScan(['**'], { filterFn: (key, value) => typeof value === 'string' })(obj);
// => ["a.b.c", "a.e.f", "a.h[0]", "a.h[1]", "k"]
objectScan(['**'], { breakFn: key => key === 'a.b' })(obj);
// => ["a", "a.b", "a.e", "a.e.f", "a.h", "a.h[0]", "a.h[1]", "k"]
```

## Edge Cases

The empty needle `""` matches top level object(s). Useful for matching objects nested in arrays by setting `useArraySelector` to `false`. Note that the empty string does not work with [_.get](https://lodash.com/docs/#get) and [_.set](https://lodash.com/docs/#set).

## Special Characters

The following Characters are considered special and need to 
be escaped if they should be matched in a key: `[`, `]`, `{`, `}`, `,`, `.` and `*`. 

When dealing with special characters the `joined` option might be desirable to set to `false`.
