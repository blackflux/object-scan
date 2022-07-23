|   |objectScanCompiled|objectScan|[jsonpath](https://www.npmjs.com/package/jsonpath)|[jsonpath-plus](https://www.npmjs.com/package/jsonpath-plus)|[jmespath](https://www.npmjs.com/package/jmespath)|
|---|---|---|---|---|---|
|<a href="./test/comparison/suites/key.js">Get Key</a>|IMG|IMG|IMG|IMG|-|
|<a href="./test/comparison/suites/value.js">Get Value</a>|IMG|IMG|IMG|IMG|IMG|
|<a href="./test/comparison/suites/condition.js">Conditional Path</a>|IMG <i><sup><a href="#timing_ref_1">[1]</a></sup></i>|IMG <i><sup><a href="#timing_ref_1">[1]</a></sup></i>|IMG|IMG|IMG|
|<a href="./test/comparison/suites/recursive.js">Recursive Traversal</a>|IMG <i><sup><a href="#timing_ref_2">[2]</a></sup></i>|IMG <i><sup><a href="#timing_ref_2">[2]</a></sup></i>|IMG <i><sup><a href="#timing_ref_3">[3]</a></sup></i>|IMG <i><sup><a href="#timing_ref_3">[3]</a></sup></i>|- <i><sup><a href="#timing_ref_4">[4]</a></sup></i>|
|<a href="./test/comparison/suites/callback.js">Callback with Context</a>|IMG <i><sup><a href="#timing_ref_5">[5]</a></sup></i>|IMG <i><sup><a href="#timing_ref_5">[5]</a></sup></i>|-|IMG <i><sup><a href="#timing_ref_6">[6]</a></sup></i>|-|
|<a href="./test/comparison/suites/parent.js">Get Parent</a>|IMG|IMG|-|IMG|-|
|<a href="./test/comparison/suites/multiplePaths.js">Multiple Paths</a>|IMG|IMG|- <i><sup><a href="#timing_ref_7">[7]</a></sup></i>|- <i><sup><a href="#timing_ref_7">[7]</a></sup></i>|-|
|<a href="./test/comparison/suites/wildcard.js">Wildcard</a>|IMG|IMG|-|-|-|
|<a href="./test/comparison/suites/regex.js">Regex</a>|IMG|IMG|-|IMG|-|
|<a href="./test/comparison/suites/exclusion.js">Exclusion</a>|IMG|IMG|-|-|-|
|<a href="./test/comparison/suites/pathRecursion.js">Path Recursion</a>|IMG|IMG|-|-|-|
|<a href="./test/comparison/suites/autoTraverse.js">Auto Traverse</a>|IMG|IMG|-|-|-|

<a id="timing_ref_1"><i>[1]</i></a>: _Only in code logic_<br>
<a id="timing_ref_2"><i>[2]</i></a>: _[Depth-first](https://en.wikipedia.org/wiki/Tree_traversal#Depth-first_search) traversal. See [here](#traversal_order) for details_<br>
<a id="timing_ref_3"><i>[3]</i></a>: _[Custom depth-first](https://cs.stackexchange.com/questions/99440) traversal_<br>
<a id="timing_ref_4"><i>[4]</i></a>: _[Reference](https://github.com/jmespath/jmespath.py/issues/110)_<br>
<a id="timing_ref_5"><i>[5]</i></a>: _[Documentation](#callbacks)_<br>
<a id="timing_ref_6"><i>[6]</i></a>: _Usefulness limited since context is lacking information_<br>
<a id="timing_ref_7"><i>[7]</i></a>: _[Reference](https://stackoverflow.com/questions/55497833/jsonpath-union-of-multiple-different-paths)_<br>
