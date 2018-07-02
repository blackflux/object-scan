# Object-Scan

[![Build Status](https://img.shields.io/travis/simlu/object-scan/master.svg)](https://travis-ci.org/simlu/object-scan)
[![Test Coverage](https://img.shields.io/coveralls/simlu/object-scan/master.svg)](https://coveralls.io/github/simlu/object-scan?branch=master)
[![Greenkeeper Badge](https://badges.greenkeeper.io/simlu/object-scan.svg)](https://greenkeeper.io/)
[![Dependencies](https://david-dm.org/simlu/object-scan/status.svg)](https://david-dm.org/simlu/object-scan)
[![NPM](https://img.shields.io/npm/v/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Downloads](https://img.shields.io/npm/dt/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Semantic-Release](https://github.com/simlu/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/simlu/js-gardener/blob/master/assets/badge.svg)](https://github.com/simlu/js-gardener)
[![Gitter](https://github.com/simlu/js-gardener/blob/master/assets/icons/gitter.svg)](https://gitter.im/simlu/object-scan)

Find Keys using Wildcard matching and optional value function.

## Install

Install with [npm](https://www.npmjs.com/):

    $ npm install --save object-scan

## Usage

<!-- eslint-disable-next-line import/no-unresolved -->
```js
const objectScan = require('object-scan');

objectScan(["a.*.f"])({ a: { b: { c: 'd' }, e: { f: 'g' } } });
// => [ 'a.e.f' ]
```

### Value Function

Constructor takes second value function parameter which gets passed in the value of the key and is expected to return true or false.
Only results where the value function returns true are returned.

### Joined

When dealing with special characters it might be desired to not have the output merged. In this case 
the constructor takes a third option which can be set to false to return each key as a list.

## Examples

More extensive examples can be found in the tests.

<!-- eslint-disable-next-line import/no-unresolved -->
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
    h: ["i", "j"]
  },
  k: "l"
};

// top level keys
objectScan(["*"])(obj);
// => ["a", "k"]

// nested keys
objectScan(["a.*.f"])(obj);
// => ["a.e.f"]
objectScan(["*.*.*"])(obj);
// => ["a.b.c", "a.e.f"]

// or filter
objectScan(["a.*.{c,f}"])(obj);
// => ["a.b.c", "a.e.f"]
objectScan(["a.*.{c,f}"], () => true, false)(obj);
// => [["a", "b", "c"], ["a", "e", "f"]]

// list filter
objectScan(["*.*[*]"])(obj);
// => ["a.h[0]", "a.h[1]"]
objectScan(["*[*]"])(obj);
// => []

// deep star filter
objectScan(["**"])(obj);
// => ["a", "a.b", "a.b.c", "a.e", "a.e.f", "a.h", "a.h[0]", "a.h[1]", "k"]
objectScan(["**.f"])(obj);
// => ["a.e.f"]
objectScan(["**[*]"])(obj);
// => ["a.h[0]", "a.h[1]"]

// value function
objectScan(["**"], e => typeof e === "string")(obj);
// => ["a.b.c", "a.e.f", "a.h[0]", "a.h[1]", "k"]
```

## Special Characters

The following Characters are considered special and need to 
be escaped if they should be matched in a key: `[`, `]`, `{`, `}`, `,`, `.` and `*`. 

When dealing with special characters the `joined` option might be desirable to set to `false`.
